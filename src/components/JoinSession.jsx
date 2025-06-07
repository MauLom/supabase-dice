import { useState } from "react";
import { ref, get, set } from "firebase/database";
import { db } from "../firebaseClient";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

export default function JoinSession({ setSessionId, setNickname }) {
  const [nick, setNick] = useState("");
  const [session, setSession] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleJoin = async () => {
    setErrorMsg("");
    if (!nick || !session) return;
    try {
      const sessionRef = ref(db, `sessions/${session}`);
      const snap = await get(sessionRef);
      const sessionData = snap.val();
      if (!sessionData) {
        setErrorMsg("Sesión no encontrada");
        return;
      }
      if (sessionData.players.some((p) => p.nick === nick)) {
        setErrorMsg("Ese nickname ya está en la sesión");
        return;
      }
      const newPlayers = [...sessionData.players, { nick }];
      await set(sessionRef, { ...sessionData, players: newPlayers });
      setSessionId(session);
      setNickname(nick);
    } catch (err) {
      setErrorMsg("Error al unirse a la sesión");
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Unirse a Sesión
        </Typography>
        <TextField
          fullWidth
          label="ID de sesión"
          variant="outlined"
          value={session}
          onChange={(e) => setSession(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Tu nickname"
          variant="outlined"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleJoin}
        >
          Unirse
        </Button>
        {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}
      </CardContent>
    </Card>
  );
}
