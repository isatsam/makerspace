import { members } from "../data";
import type { ChangeEvent } from "react";
import { setCurrentMemberCookie } from "../currentMember";
import type { Member } from "../types";

interface HeaderProps {
  currentMember: Member;
}

function Header({ currentMember }: HeaderProps) {
  // Naive dev "auth": picking a member sets the member_id cookie (read by
  // get_current_member() in the Flask API) and reloads the page so the
  // whole app re-renders with the new logged-in member.
  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setCurrentMemberCookie(id);
    window.location.reload();
  };

  return (
    <header className="page-header flex">
      <ul className="header-nav flex">
        <li><a href="#">Reserve</a></li>
        <li><a href="#">Check out</a></li>
        <li><a href="#">All equipment</a></li>
        <li><a href="#">All materials</a></li>
        <li><a href="#">Maintenance tickets</a></li>
      </ul>
      <div className="hello flex">
        <div>Hello, <span id="userName">{currentMember.first_name}</span>!</div>
        <label htmlFor="memberSwitcher" style={{ marginRight: 8 }}>
          Logged in as:
        </label>
        <select
          id="memberSwitcher"
          value={currentMember.id}
          onChange={handleSelect}
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.first_name} ({m.is_admin ? "admin" : "member"})
            </option>
          ))}
        </select>
        <ul className="header-nav flex">
          <li><a href="#">My dashboard</a></li>
          <li><a href="#">Account</a></li>
          <li><a href="#">Log out</a></li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
