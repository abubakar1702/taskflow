import { ClipLoader } from "react-spinners";

const LoadingScreen = ({
    message = "Loading...",
    fullscreen = false,
    height = "200px",
    size = 50,
    color = "#2563EB"
}) => {
    const containerClasses = fullscreen
        ? "min-h-screen flex items-center justify-center"
        : "flex items-center justify-center";

    return (
        <div
            className={containerClasses}
            style={!fullscreen ? { height } : {}}
        >
            <div className="text-center">
                <ClipLoader color={color} size={size} loading={true} />
                <p className="text-gray-600 mt-2">{message}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
