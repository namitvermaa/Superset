import EmbedDashboard from "./EmbedDashboard";

function App() {
  return (
    <div style={{
      margin: 0,
      padding: 0,
      height: "100vh",
      width: "100%",
      overflow: "hidden"
    }}>
      <h1 style={{ 
        padding: "15px 20px", 
        margin: 0, 
        backgroundColor: "#333", 
        color: "white" 
      }}>
        My SuperSet EMDedded DAshbaord
      </h1>
      <EmbedDashboard />
    </div>
  );
}

export default App;
