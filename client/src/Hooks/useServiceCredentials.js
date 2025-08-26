import { useState, useEffect } from 'react';
import { fetchIntegrateAppsId } from '../api/api_endpoints';

export const useServiceCredentials = (userId, serviceSlug) => {
    const [token, setToken] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getCreds = async () => {
            if (!userId || !serviceSlug) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const result = await fetchIntegrateAppsId(userId, serviceSlug, true);

                if (result.success && result.credentials?.credentials?.authFields?.access_token) {
                    const accessToken = result.credentials.credentials.authFields.access_token;
                    setToken(accessToken);
                    setIsConnected(true);
                } else {
                    setIsConnected(false);
                    setError(result.message || 'Failed to fetch credentials');
                }
            } catch (err) {
                setError(err.message);
                setIsConnected(false);
            } finally {
                setLoading(false);
            }
        };

        getCreds();
    }, [userId, serviceSlug]);

    return { token, isConnected, loading, error };
};