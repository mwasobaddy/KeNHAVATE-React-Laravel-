<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class RegionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $regions = Region::withCount('directorates')->ordered()->get();

        return Inertia::render('Administration/Regions/Index', [
            'regions' => $regions,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Administration/Regions/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:regions,code',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            Region::create($validated);

            return redirect()->route('administration.regions.index')
                ->with('success', 'Region created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create region: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create region. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Region $region)
    {
        $region->load(['directorates' => function ($query) {
            $query->withCount('departments')->ordered();
        }]);

        return Inertia::render('Administration/Regions/Show', [
            'region' => $region,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Region $region)
    {
        return Inertia::render('Administration/Regions/Edit', [
            'region' => $region,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Region $region)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:regions,code,' . $region->id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            $region->update($validated);

            return redirect()->route('administration.regions.index')
                ->with('success', 'Region updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update region: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update region. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Region $region)
    {
        try {
            // Check if region has directorates
            if ($region->directorates()->count() > 0) {
                return redirect()->back()
                    ->with('error', 'Cannot delete region with associated directorates.');
            }

            $region->delete();

            return redirect()->route('administration.regions.index')
                ->with('success', 'Region deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete region: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Failed to delete region. Please try again.');
        }
    }
}
