import React from 'react'
import { useParams } from "react-router-dom";

const TaskDetails = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Details for Project ID: {id}</h1>
            {/* You can render project details based on ID here */}
        </div>
    );
};

export default TaskDetails;