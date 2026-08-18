import { Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./DataProvider";
import { PageLayout } from "./PageLayout";
import { useSharedData } from "./dataContext";
import { ListPage } from "./pages/ListPage";
import { DetailPage } from "./pages/DetailPage";
import { EquipmentDetailPage } from "./pages/EquipmentDetailPage";
import { EquipmentListPage } from "./pages/EquipmentListPage";
import {
  consumableConfig,
  reservationConfig,
  checkoutConfig,
  maintenanceConfig,
  memberConfig,
} from "./resources";
import type { ResourceConfig } from "./resources";
import type {
  Consumable,
  Reservation,
  Checkout,
  MaintenanceTicket,
  Member,
} from "./types";

// A list page that pulls its items from the shared data (already fetched
// once by the provider) instead of refetching.
function ResourceListPage<T extends { id: number }>({
  config,
  items,
}: {
  config: ResourceConfig<T>;
  items: T[];
}) {
  return (
    <ListPage config={config} items={items} />
  );
}

// Convenience wrappers for each resource that source their list from the
// shared data context.
// Equipment uses a custom list page with Reserve buttons.
function ConsumableListPage() {
  const { consumables } = useSharedData();
  return <ResourceListPage config={consumableConfig} items={consumables} />;
}
function ReservationListPage() {
  const { reservations } = useSharedData();
  return <ResourceListPage config={reservationConfig} items={reservations} />;
}
function CheckoutListPage() {
  const { checkouts } = useSharedData();
  return <ResourceListPage config={checkoutConfig} items={checkouts} />;
}
function MaintenanceListPage() {
  const { maintenanceTickets } = useSharedData();
  return (
    <ResourceListPage config={maintenanceConfig} items={maintenanceTickets} />
  );
}
function MemberListPage() {
  const { membersById } = useSharedData();
  return (
    <ResourceListPage config={memberConfig} items={[...membersById.values()]} />
  );
}

function App() {
  return (
    <DataProvider>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/equipment" replace />} />
          <Route path="/equipment" element={<EquipmentListPage />} />
          <Route path="/equipment/:id" element={<EquipmentDetailRoute />} />
          <Route path="/consumable" element={<ConsumableListPage />} />
          <Route path="/consumable/:id" element={<ConsumableDetailRoute />} />
          <Route path="/reservation" element={<ReservationListPage />} />
          <Route path="/reservation/:id" element={<ReservationDetailRoute />} />
          <Route path="/checkout" element={<CheckoutListPage />} />
          <Route path="/checkout/:id" element={<CheckoutDetailRoute />} />
          <Route path="/maintenance" element={<MaintenanceListPage />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetailRoute />} />
          <Route path="/member" element={<MemberListPage />} />
          <Route path="/member/:id" element={<MemberDetailRoute />} />
        </Routes>
      </PageLayout>
    </DataProvider>
  );
}

// Detail routes pull the :id param and feed it into the right DetailPage.
import { useParams } from "react-router-dom";

function EquipmentDetailRoute() {
  const { id } = useParams();
  return <EquipmentDetailPage id={id!} />;
}
function ConsumableDetailRoute() {
  const { id } = useParams();
  return <DetailPage<Consumable> config={consumableConfig} id={id!} />;
}
function ReservationDetailRoute() {
  const { id } = useParams();
  return <DetailPage<Reservation> config={reservationConfig} id={id!} />;
}
function CheckoutDetailRoute() {
  const { id } = useParams();
  return <DetailPage<Checkout> config={checkoutConfig} id={id!} />;
}
function MaintenanceDetailRoute() {
  const { id } = useParams();
  return <DetailPage<MaintenanceTicket> config={maintenanceConfig} id={id!} />;
}
function MemberDetailRoute() {
  const { id } = useParams();
  return <DetailPage<Member> config={memberConfig} id={id!} />;
}

export default App;
