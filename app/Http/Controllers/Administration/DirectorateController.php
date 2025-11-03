<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Models\Directorate;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DirectorateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $directorates = Directorate::with(['region', 'departments'])
            ->withCount('departments')
            ->ordered()
            ->get();

        return Inertia::render('Administration/Directorates/Index', [
            'directorates' => $directorates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $regions = Region::active()->ordered()->get(['id', 'name', 'code']);

        return Inertia::render('Administration/Directorates/Create', [
            'regions' => $regions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:directorates,code',
            'region_id' => 'required|exists:regions,id',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            Directorate::create($validated);

            return redirect()->route('administration.directorates.index')
                ->with('success', 'Directorate created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create directorate: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create directorate. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Directorate $directorate)
    {
        $directorate->load(['region', 'departments' => function ($query) {
            $query->withCount('users')->ordered();
        }]);

        return Inertia::render('Administration/Directorates/Show', [
            'directorate' => $directorate,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Directorate $directorate)
    {
        $regions = Region::active()->ordered()->get(['id', 'name', 'code']);

        return Inertia::render('Administration/Directorates/Edit', [
            'directorate' => $directorate,
            'regions' => $regions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Directorate $directorate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:directorates,code,' . $directorate->id,
            'region_id' => 'required|exists:regions,id',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            $directorate->update($validated);

            return redirect()->route('administration.directorates.index')
                ->with('success', 'Directorate updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update directorate: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update directorate. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Directorate $directorate)
    {
        try {
            // Check if directorate has departments
            if ($directorate->departments()->count() > 0) {
                return redirect()->back()
                    ->with('error', 'Cannot delete directorate with associated departments.');
            }

            $directorate->delete();

            return redirect()->route('administration.directorates.index')
                ->with('success', 'Directorate deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete directorate: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Failed to delete directorate. Please try again.');
        }
    }
}
