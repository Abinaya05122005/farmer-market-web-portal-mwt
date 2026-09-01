import React from 'react'

export default function About() {
  return (
    <div className="page">
      <h1>About This Portal</h1>
      <p>
        The Farmer Market Portal connects local farmers directly with
        customers. Farmers list their produce with fair prices, and
        customers can browse, add items to a cart, and place orders
        without any middlemen.
      </p>
      <p>
        This project is built using React function components and the
        core Hooks: useState for local state, useEffect for side
        effects such as loading data, and useContext for sharing the
        product catalog, cart, and login state across pages.
      </p>
    </div>
  )
}
