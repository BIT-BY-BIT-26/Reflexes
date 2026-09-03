import React from 'react'
import { Users } from 'lucide-react'
import { useTodaysAppointments } from '../../hooks/useTodaysAppointments'
import { useConfirmAppointment } from '../../hooks/useConfirmAppointment'
import PageHeader from '../layout/PageHeader'

/*
  Today's appointment ledger. Same two hooks, same optimistic confirm mutation
  (with its rollback), same per-row busy/final logic. The Cancel button has no
  handler in the current UI and stays inert here.
*/

const statusStyles = {
  PENDING: 'bg-warning-container text-on-warning-container',
  CONFIRMED: 'bg-primary-container/20 text-primary',
  CANCELLED: 'bg-error-container text-on-error-container',
  COMPLETED: 'bg-secondary-container text-on-secondary-container',
}

const Appointment = () => {
  const { data, isLoading, isError, error, refetch } = useTodaysAppointments()
  const confirmMutation = useConfirmAppointment()

  const doctor = data?.doctor
  const patients = data?.patients ?? []

  if (isError) {
    // 🐛 DEBUG: full error object, including server response if axios
    console.error('[Appointment] fetch error:', error)
    console.error('[Appointment] error.response?.data:', error?.response?.data)
  }

  const handleConfirm = (appointmentId) => {
    if (!appointmentId) {
      console.warn('[Appointment] handleConfirm called with falsy appointmentId!')
    }
    confirmMutation.mutate(appointmentId, {
      onError: (err) => {
        console.error('[Appointment] confirm mutation failed:', err?.response?.data || err)
      },
      onSuccess: (res) => {
        console.log('[Appointment] confirm mutation success:', res)
      },
    })
  }

  const department = doctor?.department?.name
    ? doctor.department.name.charAt(0).toUpperCase() + doctor.department.name.slice(1)
    : '(no department)'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Doctor portal"
        title="Today's Appointments"
        description={
          doctor ? `${department} · ${doctor.hospital?.name || '(no hospital)'}` : undefined
        }
      >
        {!isLoading && !isError && (
          <div className="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-container/20 text-primary">
              <Users size={18} />
            </span>
            <span>
              <span className="block text-label-caps uppercase text-on-surface-variant">
                Booked today
              </span>
              <span className="block font-display text-headline-sm text-on-surface tabular">
                {patients.length}
              </span>
            </span>
          </div>
        )}
      </PageHeader>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-card bg-surface-container" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-error/40 bg-error-container px-4 py-3">
          <p className="text-body-md text-on-error-container">
            Could not load today's appointments. Please try again.
            {/* 🐛 DEBUG: show raw error message on screen too */}
            {error?.message && (
              <span className="mt-1 block text-body-sm opacity-80">({error.message})</span>
            )}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-control border border-on-error-container/30 px-3 py-1.5 text-body-sm font-medium text-on-error-container transition hover:bg-on-error-container/10"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && patients.length === 0 && (
        <div className="rounded-card border border-dashed border-outline-variant bg-surface-lowest px-6 py-14 text-center">
          <h2 className="font-display text-headline-sm text-on-surface">Nothing booked today</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            No appointments booked for today.
          </p>
        </div>
      )}

      {/* Appointment ledger */}
      {!isLoading && !isError && patients.length > 0 && (
        <section className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
          <div className="hidden grid-cols-12 gap-3 border-b border-outline-variant bg-surface-container px-5 py-2 text-label-caps uppercase text-on-surface-variant md:grid">
            <span className="col-span-1">Token</span>
            <span className="col-span-4">Patient</span>
            <span className="col-span-2">Booked</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-3 text-right">Actions</span>
          </div>

          <ul>
            {patients.map((p) => {
              const isBusy =
                confirmMutation.isPending &&
                confirmMutation.variables === p.appointmentId
              const isFinal = p.status === 'CONFIRMED' || p.status === 'CANCELLED'

              return (
                <li
                  key={p.appointmentId}
                  className="grid grid-cols-2 items-center gap-3 border-b border-outline-variant/70 px-5 py-3 transition last:border-b-0 hover:bg-surface-container md:grid-cols-12"
                >
                  {/* Token */}
                  <div className="md:col-span-1">
                    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-control bg-primary-container/20 px-2 text-body-md font-semibold text-primary tabular">
                      #{p.token}
                    </span>
                  </div>

                  {/* Patient */}
                  <div className="order-3 col-span-2 min-w-0 md:order-none md:col-span-4">
                    <p className="truncate text-body-md font-medium text-on-surface">
                      {p.patient?.userId?.name}
                    </p>
                    <p className="truncate text-body-sm text-on-surface-variant">
                      {p.patient?.userId?.email}
                    </p>
                  </div>

                  {/* Booked at */}
                  <div className="text-body-md text-on-surface-variant tabular md:col-span-2">
                    {p.bookedAt
                      ? new Date(p.bookedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <span
                      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-label-md font-medium ${
                        statusStyles[p.status] || 'bg-surface-high text-on-surface-variant'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="order-4 col-span-2 flex flex-wrap justify-end gap-2 md:order-none md:col-span-3">
                    {!isFinal && (
                      <>
                        <button
                          onClick={() => handleConfirm(p.appointmentId)}
                          disabled={isBusy}
                          className="rounded-control bg-primary px-4 py-2 text-body-sm font-semibold text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? '…' : 'Confirm'}
                        </button>
                        <button
                          disabled={isBusy}
                          className="rounded-control border border-outline-variant px-4 py-2 text-body-sm font-medium text-error transition hover:bg-error-container hover:text-on-error-container disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? '…' : 'Cancel'}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

export default Appointment
