import { RouterProvider } from "react-router-dom";
import routes from "./routes/routes";
import { ToastContainer } from "react-toastify";

const App = () => {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                toastStyle={{
                    background: "linear-gradient(135deg, #1F7A63, #6B8E85)", // pine → muted green
                    color: "#F4F8F7", // soft white
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(31, 122, 99, 0.35)",
                    fontWeight: "500",
                }}
                progressStyle={{
                    background: "linear-gradient(90deg, #B8A1D9, #D9C7F0)", // lavender tones
                }}
            />

            <RouterProvider router={routes} />
        </>
    );
};

export default App;
