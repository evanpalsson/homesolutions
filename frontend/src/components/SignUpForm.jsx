import React from 'react';
import { GoogleLogin } from 'react-google-login';
import AppleSignin from 'react-apple-signin-auth';

const SignUpForm = () => {
    const handleGoogleResponse = (response) => {
        console.log(response);
        // Send token to backend
        fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.tokenId }),
        })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.error(err));
    };

    const handleAppleResponse = (response) => {
        console.log(response);
        // Send token to backend
        fetch('/api/auth/apple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.authorization.id_token }),
        })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.error(err));
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <GoogleLogin
                clientId="YOUR_GOOGLE_CLIENT_ID"
                buttonText="Sign Up with Google"
                onSuccess={handleGoogleResponse}
                onFailure={handleGoogleResponse}
                cookiePolicy={'single_host_origin'}
            />
            <AppleSignin
                authOptions={{
                    clientId: 'YOUR_APPLE_CLIENT_ID',
                    scope: 'email name',
                    redirectURI: 'YOUR_REDIRECT_URI',
                    usePopup: true,
                }}
                onSuccess={handleAppleResponse}
                onError={(error) => console.error(error)}
                render={(renderProps) => (
                    <button onClick={renderProps.onClick}>Sign Up with Apple</button>
                )}
            />
        </div>
    );
};

export default SignUpForm;
