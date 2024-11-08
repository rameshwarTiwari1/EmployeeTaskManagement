const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    tags:{type:[String],default:[]},
    status: { 
        type: String, 
        enum: ['ToDo', 'InProgress', 'Completed'], 
        default: 'ToDo' 
    },
    
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
    },
    isPinned:{type:Boolean,default:false},
   userId:{type:String,required:true},
   createdOn:{type:Date,default: Date.now},
   dueDate: { type: Date, required: true },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
