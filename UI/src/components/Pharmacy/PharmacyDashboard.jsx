import React from 'react'
import PharmacySidebar from '../../features/pharmacy/PharmacySidebar'

const PharmacyDashboard = () => {
  return (
    <div>
        <PharmacySidebar />
<<<<<<< HEAD
        <React.Suspense fallback={null}>
          <PharmacyDashboardOverviewAddOn />
        </React.Suspense>
=======
>>>>>>> b9e6f0f6bf88485b03619677651207f148e9f35e
    </div>
  )
}

<<<<<<< HEAD
export default PharmacyDashboard

// Added: lazy-load the pharmacy analytics feature without replacing the original dashboard/sidebar code.
const PharmacyDashboardOverviewAddOn = React.lazy(() =>
  import('../../features/pharmacy/PharmacyOverview')
)
=======
export default PharmacyDashboard
>>>>>>> b9e6f0f6bf88485b03619677651207f148e9f35e
