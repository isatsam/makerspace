import type { ResolvedUserData } from "../types";

interface UserAsideProps {
  data: ResolvedUserData;
}

function UserAside({ data }: UserAsideProps) {
  return (
    <aside className="user-data">
      <div>
        <h1>Your reservations</h1>
        <table id="userReservations">
          <tbody>
            {data.reservations.map((r) => (
              <tr data-reservation-id={r.id} key={r.id}>
                <td>{r.equipment}</td>
                <td>...</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p
          className="nothing-rn"
          id="userReservationsNothing"
          style={{ display: data.reservations.length === 0 ? "block" : "none" }}
        >
          Nothing right now.
        </p>
      </div>
      <div>
        <h1>Your checkouts</h1>
        <table id="userCheckouts">
          <tbody>
            {data.checkouts.map((c) => (
              <tr data-checkout-id={c.id} key={c.id}>
                <td>
                  <a href={`/checkouts/${c.id}`}>{c.equipment}</a>
                </td>
                {c.status.toLowerCase().includes("overdue") ? (
                  <td className="overdue">{c.status}</td>
                ) : (
                  <td>Until {c.end_time}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p
          className="nothing-rn"
          id="userCheckoutsNothing"
          style={{ display: data.checkouts.length === 0 ? "block" : "none" }}
        >
          Nothing right now.
        </p>
      </div>
    </aside>
  );
}

export default UserAside;
