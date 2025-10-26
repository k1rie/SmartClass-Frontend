import { createPortal } from 'react-dom';

const Loader = ({ text = "Cargando..." }) => {
  return createPortal(
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999]">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Loader; 