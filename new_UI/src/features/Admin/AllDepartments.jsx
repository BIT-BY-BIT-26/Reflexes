import React from 'react'
import { Building2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { allDepartments } from '../../hooks/UseAllDepartment';
import PageHeader from '../../components/layout/PageHeader';

/*
  Department list. Same hook (GET /departments/doctor-count via
  DepartmentsDoctorsCount) and the same fields; the doctor-count bar keeps its
  original Math.min(totalDoctors * 20, 100) scale.
*/

const AllDepartments = () => {
  const navigate = useNavigate();

  const { data, isLoading, refetch, isError } = allDepartments();
  const departments = data?.departments ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Hospital admin"
        title="Departments"
        description="Every department registered for this hospital, with the number of doctors attached to each."
      >
        <button
          onClick={() => navigate('/hospital-dashboard/departments/add')}
          className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
        >
          <Plus size={16} />
          Add department
        </button>
      </PageHeader>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-card bg-surface-container" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-error/40 bg-error-container px-4 py-3">
          <span className="text-body-md text-on-error-container">Could not load departments.</span>
          <button
            onClick={() => refetch()}
            className="rounded-control border border-on-error-container/30 px-3 py-1.5 text-body-sm font-medium text-on-error-container transition hover:bg-on-error-container/10"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && departments.length === 0 && (
        <div className="rounded-card border border-dashed border-outline-variant bg-surface-lowest px-6 py-14 text-center">
          <h2 className="font-display text-headline-sm text-on-surface">No departments yet</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Add the first department to start assigning doctors.
          </p>
        </div>
      )}

      {!isLoading && !isError && departments.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <article
              key={dept._id}
              className="flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary-container/20 text-primary">
                    <Building2 size={18} />
                  </span>
                  <h2 className="min-w-0 truncate font-display text-title-card capitalize text-on-surface">
                    {dept.name}
                  </h2>
                </div>

                <span className="flex-none rounded-pill bg-primary-container/20 px-2.5 py-1 text-label-md font-medium capitalize text-primary">
                  {dept.status}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 flex-1 text-body-md text-on-surface-variant">
                {dept.description}
              </p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-label-caps uppercase text-on-surface-variant">Doctors</p>
                  <p className="mt-0.5 font-display text-headline-md text-on-surface tabular">
                    {dept.totalDoctors}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-label-caps uppercase text-on-surface-variant">Created</p>
                  <p className="mt-0.5 text-body-md text-on-surface tabular">
                    {new Date(dept.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Relative staffing bar, same scale as before */}
              <div className="mt-4 h-1 w-full overflow-hidden rounded-pill bg-surface-high">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(dept.totalDoctors * 20, 100)}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllDepartments
