import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>403 - Access Forbidden</h1>
            <p>You don't have permission to view this page</p>
            <button onClick={() => navigate(-1)}>Go Back</button>
            <button onClick={() => navigate('/')}>Home Page</button>
        </div>
    );
}