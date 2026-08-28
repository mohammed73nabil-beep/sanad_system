<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('products')->orderBy('name')->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:7',
        ], [
            'name.required' => 'يرجى إدخال اسم التصنيف.',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);
        AuditLog::record('create', "تمت إضافة التصنيف الجديد: {$category->name}", $category);

        return redirect()->back()->with('success', 'تمت إضافة التصنيف بنجاح.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:7',
            'is_active'   => 'boolean',
        ], [
            'name.required' => 'يرجى إدخال اسم التصنيف.',
        ]);

        $category->update($validated);
        AuditLog::record('update', "تم تحديث التصنيف: {$category->name}", $category);

        return redirect()->back()->with('success', 'تم تحديث التصنيف بنجاح.');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return redirect()->back()->with('error', 'لا يمكن حذف التصنيف لأنه مرتبط بمنتجات.');
        }

        $category->delete();
        AuditLog::record('delete', "تم حذف التصنيف: {$category->name}", $category);

        return redirect()->back()->with('success', 'تم حذف التصنيف بنجاح.');
    }
}
