import React, { memo } from 'react';
import PropertyDetails from "../components/PropertyDetails";
import '../styles/InspectionForm.css';
import InspectionDetails from '../components/InspectionDetails';

function CoverPage() {
    

    return (
        <>
        <div>
            <PropertyDetails />
            <InspectionDetails />
        </div></>



    );
}

export default memo(CoverPage);