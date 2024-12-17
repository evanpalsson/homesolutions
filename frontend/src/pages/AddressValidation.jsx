import React from 'react';
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api'
import { useRef } from 'react';
import '../styles/AddressValidation.css';

const libraries = ['places']

function AddressValidation() {
    const inputref = useRef(null)
    const { isLoaded } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
      libraries: libraries
    })

    // console.log(isLoaded)

    const handleOnPlacesChanged = () => {
        let address = inputref.current.getPlaces()
        console.log("address", address)
    }

    return (
        <div style={{marginTop:"10%", textAlign:"center"}}>
            {isLoaded &&
                <StandaloneSearchBox
                    onLoad={(ref) => inputref.current = ref}
                    onPlacesChange={handleOnPlacesChanged}
                >
                    <input
                        type="text"
                        name="property_search"
                        placeholder="Search for a property"
                        required
                    />
                </StandaloneSearchBox>
            }
        </div>
    )
}

export default AddressValidation;
