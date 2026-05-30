import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';

dotenv.config();

const resetCreds = async () => {
    try {
        await connectDB();
        
        async function re(name, id, pass) {
            const u = await User.findOne({name});
            if (u) {
                u.userId = id;
                u.password = pass;
                await u.save(); // triggers bcrypt hash hook natively
            }
        }
        
        await re('System Admin', '12693714', 'Temp@5a2b1c9f!');
        await re('Teacher One', '12684201', 'Temp@8d3e4b7a!');
        await re('Teacher Two', '12639145', 'Temp@f1a9b2c3!');
        await re('Teacher Three', '12658427', 'Temp@b7c6d1a9!');

        console.log('Reset complete.');
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
};

resetCreds();
