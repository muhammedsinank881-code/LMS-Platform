import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DeleteMaterialDialog } from '../components/DeleteMaterialDialog'
import { MaterialCard } from '../components/MaterialCard'
import { MaterialDetailsModal } from '../components/MaterialDetailsModal'
import { MaterialFilters } from '../components/MaterialFilters'
import { MaterialTable } from '../components/MaterialTable'
import { MaterialsEmptyState } from '../components/MaterialsEmptyState'
import { MaterialsHeader } from '../components/MaterialsHeader'
import { UploadMaterialModal } from '../components/UploadMaterialModal'
import { useMaterials } from '../hooks/useMaterials'

export function MaterialsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    materials,
    allMaterialsCount,
    filters,
    setFilters,
    availableCourses,
    availableModules,
    isUploadOpen,
    setIsUploadOpen,
    selectedMaterial,
    setSelectedMaterial,
    deletingMaterial,
    setDeletingMaterial,
    handleAddMaterial,
    handleToggleStatus,
    handleDeleteMaterial,
  } = useMaterials()

  // Open upload modal if query string contains ?upload=true
  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setIsUploadOpen(true)
      // Remove query param to keep URL clean
      setSearchParams((params) => {
        params.delete('upload')
        return params
      })
    }
  }, [searchParams, setSearchParams, setIsUploadOpen])

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. Page Header */}
      <MaterialsHeader onOpenUploadModal={() => setIsUploadOpen(true)} />

      {/* 2. Filters & Controls */}
      {allMaterialsCount > 0 ? (
        <MaterialFilters
          filters={filters}
          onFiltersChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
          availableCourses={availableCourses}
          availableModules={availableModules}
          totalCount={materials.length}
        />
      ) : null}

      {/* 3. Main Content: Empty State vs Cards / Table */}
      {materials.length === 0 ? (
        <MaterialsEmptyState onUpload={() => setIsUploadOpen(true)} />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <MaterialTable
              materials={materials}
              onViewDetails={(mat) => setSelectedMaterial(mat)}
              onToggleStatus={(id) => handleToggleStatus(id)}
              onDelete={(mat) => setDeletingMaterial(mat)}
            />
          </div>

          {/* Mobile / Tablet Card View */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {materials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onViewDetails={(mat) => setSelectedMaterial(mat)}
                onToggleStatus={(id) => handleToggleStatus(id)}
                onDelete={(mat) => setDeletingMaterial(mat)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Upload Material Modal */}
      <UploadMaterialModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        availableCourses={availableCourses}
        availableModules={availableModules}
        onSubmit={handleAddMaterial}
      />

      {/* 5. Material Details Drawer / Modal */}
      <MaterialDetailsModal
        material={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        onToggleStatus={handleToggleStatus}
        onDelete={(mat) => {
          setSelectedMaterial(null)
          setDeletingMaterial(mat)
        }}
      />

      {/* 6. Delete Confirmation Dialog */}
      <DeleteMaterialDialog
        material={deletingMaterial}
        onClose={() => setDeletingMaterial(null)}
        onConfirmDelete={(id) => handleDeleteMaterial(id)}
      />
    </div>
  )
}

export const Materials = MaterialsPage
export default MaterialsPage
