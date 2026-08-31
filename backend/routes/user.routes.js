import { Router } from "express";
import { activeCheck } from "../controllers/posts.controller.js";
import { getAllUserProfile, getUserAndProfile, getUserProfileAndUserBasedOnUsername, login, register, updateProfileData, updateProfilePicture, updateUserProfile } from "../controllers/user.controller.js";
import multer from "multer";
import { downloadProfile } from "../controllers/user.controller.js";
import { sendConnectionRequest, getMyConnectionsRequests, myConnections, acceptConnectionRequest, getSentConnectionRequests } from "../controllers/user.controller.js";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.route('/update_profile_picture')
.post(upload.single('profile_picture'), updateProfilePicture);


router.route('/register').post(register);
router.route('/login').post(login);
router.route('/user_update').post(updateUserProfile);
router.route('/get_user_and_profile').get(getUserAndProfile);
router.route('/update_profile_data').post(updateProfileData);
router.route('/user/get_all_users').get(getAllUserProfile);
router.route('/user/download_resume').get(downloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/get_connection_requests").get(getMyConnectionsRequests);
router.route("/user/get_sent_connection_requests").get(getSentConnectionRequests);
router.route("/user/user_connection_request").get(myConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router.route("/user/get_user_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername);
export default router;