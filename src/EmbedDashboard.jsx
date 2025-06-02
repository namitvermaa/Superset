import { useEffect, useRef, useState } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import axios from "axios";
import { SUPERSET_URL, DASHBOARD_ID, GUEST_TOKEN_API, USERNAME, ROLE_NAME } from "./config";

async function loginToSuperset() {
  const loginResponse = await axios.post(
    `${SUPERSET_URL}/api/v1/security/login`,
    {
      username: USERNAME,
      password: "admin",
      provider: "db",
      refresh: true,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return loginResponse.data.access_token;
}

async function fetchGuestTokenFromBackend() {
  const accessToken = await loginToSuperset();

  const csrfResponse = await axios.get(
    `${SUPERSET_URL}/api/v1/security/csrf_token/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    }
  );
  const csrfToken = csrfResponse.data.result;

  const response = await axios.post(
    `${SUPERSET_URL}${GUEST_TOKEN_API}`,
    {
      user: {
        username: USERNAME,
        first_name: "Superset", 
        last_name: "Admin",  
        roles: [ROLE_NAME], 
      },
      resources: [
        {
          type: "dashboard",
          id: DASHBOARD_ID,
        }
      ],
      rls: [], 
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    }
  );
  
  console.log("Guest token response:", response.data); 
  return response.data.token;
}

const EmbedDashboard = () => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const embedDashboardInstance = async () => {
      try {
        setLoading(true);
        await embedDashboard({
          id: DASHBOARD_ID,
          supersetDomain: SUPERSET_URL,
          mountPoint: containerRef.current,
          fetchGuestToken: () => fetchGuestTokenFromBackend(),
          dashboardUiConfig: {
            hideTitle: false,
            hideChartControls: false, 
            hideTab: false,
            filters: {
              visible: true,
              expanded: true, 
            },
            showMyChartEditorModal: true, 
          },
          
          iframeSandboxExtras: ['allow-same-origin', 'allow-scripts', 'allow-forms']
        });
        setLoading(false);
      } catch (err) {
        console.error("Error embedding dashboard:", err);
        setError("Failed to load dashboard: " + (err.message || "Unknown error"));
        setLoading(false);
      }
    };

    embedDashboardInstance();
  }, []);

  return (
    <div className="dashboard-container" style={{ 
      width: "100%", 
      height: "calc(100vh - 80px)",
      overflow: "hidden",
      position: "relative",
      margin: "0",
      padding: "0",
      backgroundColor: "#fff"
    }}>
      {loading && <div className="loading">Loading dashboard...</div>}
      {error && <div className="error">{error}</div>}
      <div 
        ref={containerRef} 
        style={{ 
          width: "100%", 
          height: "100%",
          border: "none",
        }} 
      />
    </div>
  );
};

export default EmbedDashboard;
