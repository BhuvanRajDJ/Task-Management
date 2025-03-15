import React, {useEffect, useState} from 'react';
import { FaCheck, FaPencilAlt, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'; 
import { ToastContainer } from 'react-toastify';
import {CreateTask,FetchTask,DeleteTasks,CompletedTasks} from './Api'
import {notify} from './Utils'
 

function TaskManager() {

  const [taskdata, settaskdata] = useState({
    taskName: "",
    taskDescription: "",
    taskDueDate: "",
    priority: "",
    isDone:false
  });

const [input, setInput] = useState([]);
const [tasks, setTasks] = useState([]);
const [copyTasks, setCopyTasks] = useState([]);
const [updateTask, setUpdateTask] = useState(null);

const [filterStatus, setFilterStatus] = useState("all");
const [filterPriority, setFilterPriority] = useState("all");

const handleTask = (event) => {
  event.preventDefault();
  if (updateTask && input) {
      //upadte api call
      console.log('update api call');
      const obj = {
        taskName: taskdata.taskName,
        taskDescription: taskdata.taskDescription,
        taskDueDate: taskdata.taskDueDate,
        priority: taskdata.priority,
          isDone: updateTask.isDone,
          _id: updateTask._id
      }
      handleUpdateItem(obj);
      setUpdateTask(null);
      settaskdata({
        taskName: "",
    taskDescription: "",
    taskDueDate: "",
    priority: "",
    isDone:false
      });
  } else if (updateTask === null && input) {
      console.log('create api call')
      //create api call
      handleSubmit();
      // handleSubmit;
  }
 
}

useEffect(() => {
  if (updateTask) {
      settaskdata({
        taskName: updateTask.taskName || "",
        taskDescription: updateTask.taskDescription || "",
        taskDueDate: updateTask.taskDueDate || "",
        priority: updateTask.priority || "",
        isDone: updateTask.isDone || false
      });
  }
}, [updateTask])

const handleUpdateItem = async (item) => {
  const { _id, isDone, taskName, taskDescription, taskDueDate, priority } = item;
  const obj = {
    taskName,
    taskDescription,  
    taskDueDate,      
    priority,         
    isDone: isDone
  }
  
  try {
      const { success, message } = await CompletedTasks(_id, obj);
      if (success) {
          //show success toast
          notify(message, 'success')
      } else {
          //show error toast
          notify(message, 'error')
      }
      fetchAllTasks()
  } catch (err) {
      console.error(err);
      notify('Failed to create task', 'error')
  }finally{
    setInput([]);
  }
}

const handleSubmit = async () => {
  console.log("due date",taskdata.taskDueDate);

const obj = { 
  "taskName":taskdata.taskName,
  "taskDescription":taskdata.taskDescription,
  "taskDueDate":taskdata.taskDueDate.split('T')[0],
  "priority":taskdata.priority,
  "isDone":false
}

try{
  const {success, message} = await CreateTask(obj);
  if(success){
    notify(message, "success");
    settaskdata({
      taskName: "",
      taskDescription: "",
      taskDueDate: "",
      priority: "",
      isDone:false
    });
    fetchAllTasks();
  }else{
    notify(message, "error")
  }
  
}
catch (error){
  console.error(error);
  notify("Failed to create task", "error");
}
}

const fetchAllTasks = async () => {
try{
  const reversed_data = await FetchTask();
  const data = reversed_data.data.slice().reverse();
  setTasks(data);
  setCopyTasks(data);

  console.log(data);
}catch(error){
  console.log(`Could not fetch the data. error:${error}`);
}

}
useEffect(() => {
  fetchAllTasks()
}, [])


const deleteTask = async (id) => {
  try{
    const {success, message} = await DeleteTasks(id);
    if(success){
      notify(message, 'success');
    }
    else{
      notify(message, 'error');
    }
    fetchAllTasks();
  }catch(error){
    console.log(error);
    notify("Failed to delete the task","error");
  }
}

const CompletedTask = async(item) => {
  const {_id, isDone, taskName,taskDescription,taskDueDate,priority,} = item;
  const obj = {
    taskName,
    taskDescription,
    taskDueDate,
    priority,
    isDone: !isDone
  }
  try{
    const {success, message} = await CompletedTasks(_id, obj);
    if(success){
      notify(message, 'success');
    }else{
      notify(message, 'error');
    }
    fetchAllTasks();
  }catch(error){
    console.error(error);
    notify('Failed to create a task', 'error')
  }
}

useEffect(() => {
  console.log("tasks",tasks);
  console.log("copyTasks",copyTasks);

}, [tasks,copyTasks]);

// useEffect(() => {
//   console.log("copyTasks",copyTasks);
// }, [copyTasks]);



const handleChange = (event) => {
const {name, value} = event.target;
settaskdata((prevData) => ({...prevData, [name]:value}));
    }
const handleSearch = (event) =>{
  const term = event.target.value;
  const oldTasks = [...copyTasks];
  const result = oldTasks.filter((item) => item.taskName.toLowerCase().includes(term));
  setTasks(result);
  
}

useEffect(() => {
  const filtered = copyTasks.filter(task =>
    (filterStatus === "all" || task.isDone == (filterStatus === "true")) &&
    (filterPriority === "all" || task.priority == filterPriority)
  );
  setTasks(filtered);
  console.log("tasks: ", tasks);
  console.log("filterd data: ", filtered);
}, [filterStatus, filterPriority, copyTasks]);

const scrollToSection = (section) => {
  document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  
}

    return (
      <>
            <div className="container1" id="formsection">
              <h1 className="title">TaskMate</h1>
              
              <div className="card" >
                <form onSubmit={handleTask} >
                  <div className="form-group1">
                    <label htmlFor="taskName">Task Name:</label>
                    <input type="text" id="taskName" name="taskName" value={taskdata.taskName} onChange = {handleChange} required />
                  </div>
                  
                  <div className="form-group1">
                    <label htmlFor="taskDescription">Task Description:</label>
                    <textarea id="taskDescription" name="taskDescription" value={taskdata.taskDescription} onChange = {handleChange} required></textarea>
                  </div>
                  
                  <div className="form-group1">
                    <label htmlFor="taskDueDate">Task Due Date:</label>
                    <input type="date" id="taskDueDate" name="taskDueDate" value={taskdata.taskDueDate.split('T')[0]} onChange = {handleChange} required />
                  </div>
                  
                  <div className="form-group1">
                    <label htmlFor="priority">Priority:</label>
                    <select id="priority" name="priority" onChange = {handleChange} value={taskdata.priority}  required>
                    <option value="">Select the Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  
                  

                  <button type="submit" className="submit-btn" >Submit Task</button>
                </form>
              </div>
              
              <div className="search-group">
                <input type='text' placeholder='Search for a task' onChange={handleSearch} />
                <button className='search-btn1'>
                  <FaSearch /> Search
                </button>
              </div>
              </div>
        <div className='filter'>
              <label>Status: </label>
      <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
        <option value="all">All</option>
        <option value={false}>Pending</option>
        <option value={true} >Completed</option>
      </select>

      <label> Priority: </label>
      <select onChange={(e) => setFilterPriority(e.target.value)} value={filterPriority}>
        <option value="all">All</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      </div>

      
        {/* All tasks */}
        <div className='task-container'>
    {
      tasks.map((item) =>(
        <div key={item._id} className="task-card">
        <h3 className={item.isDone ? 'text-decoration-line-through' : ''}>{item.taskName}</h3>
        <p className={item.isDone ? 'text-decoration-line-through' : ''}>{item.taskDescription}</p>
        <p className={item.isDone ? 'text-decoration-line-through' : ''}>
          <strong>Due Date:</strong> {item.taskDueDate.split('T')[0]}
        </p>
        <p className={item.isDone ? 'text-decoration-line-through' : ''}>
          <strong>Priority:</strong> {item.priority}
        </p>
      
        <div className="button-group">
          <button className="btn-success" type="button" onClick= {()=>CompletedTask(item)}>Completed</button>
          <button className="btn-primary" type="button" onClick={() => {setUpdateTask(item); scrollToSection("formsection")}}>Edit</button>
          <button className="btn-danger" type="button" onClick={()=>deleteTask(item._id)} >Delete</button>
        </div>
      </div>
      

      ))
    }</div>


{/* ToastContainer */}
<ToastContainer 
position="top-right"
autoClose = {3000}
hideProgressBar = {false}
/>
        
        </>
      );
    }
    

export default TaskManager