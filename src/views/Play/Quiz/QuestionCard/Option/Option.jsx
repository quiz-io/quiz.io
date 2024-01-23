import clsx from 'clsx';
import './Option.css';

export default function Option({ label, right, selected, onClick }) {
  return (
    <div className="Option">
      <button
        className={clsx('button', { right: right, selected: selected })}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}