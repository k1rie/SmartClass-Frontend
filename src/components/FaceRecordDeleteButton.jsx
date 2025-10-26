import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

const FaceRecordDeleteButton = ({ studentId, onDelete }) => {
  const handleClick = () => {
    if (typeof onDelete === "function") {
      onDelete(studentId);
      return;
    }

    // Fallback: dispatch a global event so external logic can handle it
    const event = new CustomEvent("delete-face-record", {
      detail: { studentId }
    });
    window.dispatchEvent(event);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Trash2 className="w-4 h-4 mr-2" />
      Eliminar Registro Facial
    </Button>
  );
};

export default FaceRecordDeleteButton;


