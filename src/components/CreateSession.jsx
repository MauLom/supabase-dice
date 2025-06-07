import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "../firebaseClient";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

export default function CreateSession({ setSessionId, setNickname }) {
  const [nick, setNick] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!nick) return;
    try {
      const sessionsRef = ref(db, "sessions");
      const newSessionRef = push(sessionsRef);
      await set(newSessionRef, {
        players: [{ nick }],
        rolls: [],
        createdAt: Date.now(),
      });
      setSessionId(newSessionRef.key);
      setNickname(nick);
    } catch (err) {
      setErrorMsg("No se pudo crear la sesión");
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Crear Sesión
        </Typography>
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
          color="success"
          onClick={handleCreate}
        >
          Crear
        </Button>
        {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}
      </CardContent>
    </Card>
  );
}
