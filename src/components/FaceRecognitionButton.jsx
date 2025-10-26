import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Camera } from "lucide-react";
import FaceRecognitionModal from "./FaceRecognitionModal";

const FaceRecognitionButton = ({ studentId, variant = "outline", size = "sm" }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button 
                variant={variant} 
                size={size} 
                onClick={handleOpenModal}
            >
                <Camera className="w-4 h-4 mr-2" />
                Reconocimiento Facial
            </Button>
            
            <FaceRecognitionModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                studentId={studentId}
            />
        </>
    );
};

export default FaceRecognitionButton;
