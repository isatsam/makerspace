interface HeaderProps {
  firstName: string;
}

function Header({ firstName }: HeaderProps) {
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
        <div>Hello, <span id="userName">{firstName}</span>!</div>
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
