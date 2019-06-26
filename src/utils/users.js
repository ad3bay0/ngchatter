const users = [];

//add user, remove user, getUser, get users in a room

const addUser = ({id,username,room})=>{

    //clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data
    if(!username||!room){

        return{
            error: 'username and room required!'
        }
    }

    //check for existin user
    const existingUser = users.find((user)=>{

        return user.room === room && user.username === username
    });

    if(existingUser){

        return{
            error: 'username in use!'
        }
    }

    const user = {id,username,room};

    users.push(user);

    return {user};

};

const removeUser = (id)=>{

    const index = users.findIndex(user=>{

        return user.id === id;

    });

    if(index !== -1){

        return users.splice(index,1)[0];

    }

};

const getUser = (id)=>{

   return users.find((user)=>user.id === id);
};

const getUsersByRoom = (room)=>{

return users.filter((user)=>user.room === room);
}


module.exports = {addUser,removeUser,getUser,getUsersByRoom}