import { useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CreateSession from "./components/CreateSession";
import JoinSession from "./components/JoinSession";
import SessionRoom from "./components/SessionRoom";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [nickname, setNickname] = useState("");

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(120deg, #e0ecfc 0%, #c7eafd 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h3"
          fontWeight="bold"
          align="center"
          color="primary"
          mb={4}
          sx={{ textShadow: "0 2px 12px #fff" }}
        >
          🎲 Firebase Dice Room
        </Typography>
        {!sessionId ? (
          <Box display="flex" flexDirection="column" gap={4}>
            <CreateSession setSessionId={setSessionId} setNickname={setNickname} />
            <JoinSession setSessionId={setSessionId} setNickname={setNickname} />
          </Box>
        ) : (
          <SessionRoom sessionId={sessionId} nickname={nickname} />
        )}
      </Container>
    </Box>
  );
}

export default App;
