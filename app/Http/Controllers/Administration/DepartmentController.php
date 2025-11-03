<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Directorate;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $departments = Department::with(['directorate.region', 'users'])
            ->withCount('users')
            ->ordered()
            ->get();

        return Inertia::render('Administration/Departments/Index', [
            'departments' => $departments,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $regions = Region::active()->ordered()->get(['id', 'name', 'code']);
        $directorates = Directorate::active()->ordered()->get(['id', 'name', 'code', 'region_id']);

        return Inertia::render('Administration/Departments/Create', [
            'regions' => $regions,
            'directorates' => $directorates,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:departments,code',
            'directorate_id' => 'required|exists:directorates,id',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            Department::create($validated);

            return redirect()->route('administration.departments.index')
                ->with('success', 'Department created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create department: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create department. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Department $department)
    {
        $department->load(['directorate.region', 'users' => function ($query) {
            $query->select('id', 'name', 'email')->ordered();
        }]);

        return Inertia::render('Administration/Departments/Show', [
            'department' => $department,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Department $department)
    {
        $department->load(['directorate.region']);
        $regions = Region::active()->ordered()->get(['id', 'name', 'code']);
        $directorates = Directorate::active()->ordered()->get(['id', 'name', 'code', 'region_id']);

        return Inertia::render('Administration/Departments/Edit', [
            'department' => $department,
            'regions' => $regions,
            'directorates' => $directorates,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:departments,code,' . $department->id,
            'directorate_id' => 'required|exists:directorates,id',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            $department->update($validated);

            return redirect()->route('administration.departments.index')
                ->with('success', 'Department updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update department: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update department. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department)
    {
        try {
            // Check if department has users
            if ($department->users()->count() > 0) {
                return redirect()->back()
                    ->with('error', 'Cannot delete department with associated users.');
            }

            $department->delete();

            return redirect()->route('administration.departments.index')
                ->with('success', 'Department deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete department: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Failed to delete department. Please try again.');
        }
    }
}
