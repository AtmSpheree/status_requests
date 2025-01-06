import './App.css'
import {Route, Routes} from "react-router-dom";
// import Register from "./components/Register/Register.jsx";
// import NotFound from "./components/NotFound/NotFound.jsx";
// import Login from "./components/Login/Login.jsx";
// import Home from "./components/Home/Home.jsx";
// import AuthSlider from "./components/AuthSlider/AuthSlider.jsx";
// import RegisterSuccess from "./components/RegisterSuccess/RegisterSuccess.jsx";
// import RegisterConfirm from "./components/RegisterConfirm/RegisterConfirm.jsx";
// import ForgotPassword from "./components/ForgotPassword/ForgotPassword.jsx";
// import SendRequest from "./components/SendRequest/SendRequest.jsx";
// import Header from "./components/Header/Header.jsx";
// import Profile from "./components/Profile/Profile.jsx";
// import Request from "./components/Request/Request.jsx";

import {lazy} from "react";

const Register = lazy(() => import("./components/Register/Register.jsx"));
const NotFound = lazy(() => import("./components/NotFound/NotFound.jsx"));
const Login = lazy(() => import("./components/Login/Login.jsx"));
const Home = lazy(() => import("./components/Home/Home.jsx"));
const AuthSlider = lazy(() => import("./components/AuthSlider/AuthSlider.jsx"));
const RegisterSuccess = lazy(() => import("./components/RegisterSuccess/RegisterSuccess.jsx"));
const RegisterConfirm = lazy(() => import("./components/RegisterConfirm/RegisterConfirm.jsx"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword/ForgotPassword.jsx"));
const SendRequest = lazy(() => import("./components/SendRequest/SendRequest.jsx"));
const Header = lazy(() => import("./components/Header/Header.jsx"));
const Profile = lazy(() => import("./components/Profile/Profile.jsx"));
const Request = lazy(() => import("./components/Request/Request.jsx"));

function App() {

  return (
    <>
      <Routes>
        <Route element={<Header/>}>
          <Route path="/" element={<Home/>}/>
          <Route path="/send_request" element={<SendRequest/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/request/:id" element={<Request/>}/>
        </Route>
        <Route element={<AuthSlider/>}>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
        </Route>
        <Route path="/register_success" element={<RegisterSuccess/>}/>
        <Route path="/confirm_register/:token" element={<RegisterConfirm/>}/>
        <Route path="/forgot_password" element={<ForgotPassword/>}/>
        <Route path="/reset_password/:token" element={<ForgotPassword/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </>
  )
}

export default App
