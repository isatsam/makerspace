import { useState } from "react";
import { DetailPage } from "./DetailPage";
import { ReserveFlow } from "../components/ReserveFlow";
import { equipmentConfig } from "../resources";
import type { Equipment } from "../types";
import { useSharedData } from "../dataContext";

interface EquipmentDetailPageProps {
  id: number | string;
}

export function EquipmentDetailPage({ id }: EquipmentDetailPageProps) {
  const { currentMember, equipmentById } = useSharedData();
  const [reserving, setReserving] = useState(false);

  // The Reserve button shows for any logged-in member (admins too). It opens
  // the reservation overlay; the equipment name is resolved from the shared
  // equipment lookup (all equipment is fetched up front by the provider).
  return (
    <>
      <DetailPage<Equipment>
        config={equipmentConfig}
        id={id}
        extraActions={() =>
          reserving ? null : (
            <button
              className="reserve-button"
              onClick={() => setReserving(true)}
            >
              Reserve
            </button>
          )
        }
      />
      {reserving && (
        <ReserveFlow
          equipmentId={Number(id)}
          equipmentName={
            equipmentById.get(Number(id))?.unique_name ?? `equipment #${id}`
          }
          memberId={currentMember.id}
          onClose={() => setReserving(false)}
        />
      )}
    </>
  );
}

export default EquipmentDetailPage;
