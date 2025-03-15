import {API_URL} from './Utils'



export const CreateTask= async (taskObj) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(taskObj)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error creating task:", error);
        throw error; 
    }
};

export const FetchTask= async () => {
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json' 
            },
            
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error Fetching the task:", error);
        throw error; 
    }
};

export const DeleteTasks = async (id) => {
    const url = `${API_URL}/${id}`;
    console.log('url', url);
    try {
        const response = await fetch(url, {
        method:'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}catch(error){
    return error;
}};

export const CompletedTasks = async(id, reqBody) => {
try{
    const response = await fetch(`${API_URL}/${id}`,{
        method:"PUT",
headers:{
    'Content-Type':'application/json'
},
body: JSON.stringify(reqBody)
    });

    const data = await response.json();
    return data;
}catch(error){
    return error;
}
}


