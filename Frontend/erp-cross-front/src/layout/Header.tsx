import './Header.css';

interface Props {
  title: string;
}

export default function Header({ title }: Props) {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
    </header>
  );
}
