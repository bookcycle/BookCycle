import mongoose from "mongoose";
import bcrypt from "bcryptjs"; //or bcrypt

const userSchema = mongoose.Schema({
    firstName: {type: String, required: true, trim: true},
    lastName: {type: String, required: true, trim: true},
    email: {type:String, required: true, unique: true, lowercase: true, index: true, match: /.+\@.+\..+/},
    password: {type:String, required: true, minlength: 8},
})


//this func shall be run just before User document is saved
userSchema.pre("save", async function(next){
    if(!this.isModified("password"))
        return next()
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function(plain){
    return bcrypt.compare(plain, this.password);
}


export const User = mongoose.model("User", userSchema); //the name of the mongoDb collection'll be users (automatically pluralized)