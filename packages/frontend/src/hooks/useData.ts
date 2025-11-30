import { useState, useEffect } from "react";

function useData<T>(endpoint: string) {
    const devicesEndpoint = "http://localhost:3000/api/v1" + endpoint;

    const [data, setData]           = useState<T[]>([]);
    const [error, setError]         = useState("");
    const [isLoading, setLoading]   = useState(false);

    useEffect(() => {
        setLoading(true);

        fetch(devicesEndpoint)
            .then(response  => response.json())
            .then(data      => setData(data))
            .catch(error    => setError(error.message))
            .finally(()     => setLoading(false));
    }, []);

    return { data, error, isLoading };
}

export default useData;