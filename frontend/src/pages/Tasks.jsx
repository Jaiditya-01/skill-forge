import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Check, Plus, Trash2, Calendar, Target, Award } from 'lucide-react';

const Tasks = () => {
  const { refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('Goal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        type: newTaskType,
        xp_reward: newTaskType === 'Milestone' ? 100 : 50
      });
      setNewTaskTitle('');
      fetchTasks();
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const completeTask = async (id) => {
    try {
      await api.post(`/tasks/${id}/complete`);
      fetchTasks();
      refreshUser(); // Refresh user stats/XP
    } catch (error) {
      console.error('Failed to complete task', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const todos = tasks.filter(t => t.status === 'Todo');
  const done = tasks.filter(t => t.status === 'Done');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Active Quests</h1>
        <p className="text-gray-400 mt-1">Complete tasks to earn XP and level up.</p>
      </div>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="glass-card flex items-center space-x-4 p-4">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Add a new quest..." 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <select 
          value={newTaskType}
          onChange={(e) => setNewTaskType(e.target.value)}
          className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="Goal">Daily Goal (50 XP)</option>
          <option value="Milestone">Milestone (100 XP)</option>
        </select>
        <button 
          type="submit"
          className="glass-button bg-cyan-600 hover:bg-cyan-700 shadow-[0_0_15px_rgba(8,145,178,0.5)] flex items-center h-10 py-0"
        >
          <Plus className="w-5 h-5 mr-1" /> Add
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Tasks list */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h2>Current Objectives</h2>
            <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">
              {todos.length}
            </span>
          </div>
          
          {loading ? (
            <p className="text-gray-400 border border-white/10 rounded-xl p-6 text-center">Loading quests...</p>
          ) : todos.length === 0 ? (
            <div className="glass-card text-center py-10 opacity-70">
              <p className="text-gray-400">Your quest log is empty.</p>
            </div>
          ) : (
            todos.map(task => (
              <div key={task.id} className="glass-card p-4 flex items-center justify-between group transform transition-all hover:scale-[1.01] hover:border-purple-500/30">
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${task.type === 'Milestone' ? 'bg-amber-400' : 'bg-purple-400'}`}></div>
                  <div>
                    <h3 className="text-white font-medium">{task.title}</h3>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center text-purple-400 font-semibold">
                        <Award className="w-3 h-3 mr-1" />
                        {task.xp_reward} XP
                      </span>
                      {task.due_date && (
                         <span className="flex items-center">
                           <Calendar className="w-3 h-3 mr-1" />
                           {new Date(task.due_date).toLocaleDateString()}
                         </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => completeTask(task.id)} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20" title="Complete Quest">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20" title="Abandon Quest">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed list */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-400 font-bold mb-4">
            <Check className="w-5 h-5 text-emerald-500" />
            <h2>Completed</h2>
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs">
              {done.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {done.map(task => (
              <div key={task.id} className="glass-panel p-3 rounded-xl flex items-center justify-between opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <h3 className="text-gray-300 line-through">{task.title}</h3>
                </div>
                <span className="text-emerald-400 text-xs font-semibold">+{task.xp_reward} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
