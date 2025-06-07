import { useEffect, useState, useRef } from "react";
import { ref, onValue, off } from "firebase/database";
import { db } from "../firebaseClient";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import LeftPanel from "./LeftPanel";
import CenterPanel from "./CenterPanel";
import RightPanel from "./RightPanel";

// --- Etiqueta humorística en base al resultado ---
function getFunnyLabel(roll) {
  if (roll.pending) return null;

  // Casos críticos (crítico/fallo)
  if (roll.value === 1) {
    const fails = [
      "¡Fallo épico! 🤦‍♂️",
      "¿Seguro que no era una piedra? 💀",
      "Tira el dado... y la dignidad. 🥲",
      "El universo se burla de ti. 🫠",
    ];
    return fails[Math.floor(Math.random() * fails.length)];
  }
  if (roll.value === (roll.sides || (roll.dice === "D20" ? 20 : roll.dice === "D12" ? 12 : roll.dice === "D10" ? 10 : roll.dice === "D8" ? 8 : roll.dice === "D6" ? 6 : 20))) {
    const crits = [
      "¡Crítico legendario! 🏆",
      "¡Digno de canción épica! 🎸",
      "¿Eres un héroe? ¡Oh sí! 🌟",
      "¡Tiraste los dioses contigo! ⚡",
    ];
    return crits[Math.floor(Math.random() * crits.length)];
  }

  // Casos especiales
  if (roll.value === 13) return "¿Supersticioso? ¡Número de la suerte! 🍀";
  if (roll.value === 7) return "El número mágico... ¿o solo suerte? ✨";
  if (roll.value === 3 && (roll.dice === "D6" || roll.sides === 6)) return "Tres: ni bien ni mal. 😌";
  if (roll.value === 2) return "Mejor suerte la próxima... 😬";
  if (roll.value === 4 && (roll.dice === "D6" || roll.sides === 6)) return "El número de la estabilidad. 🪨";

  // Casos según rangos
  if (roll.value > ((roll.sides || 20) * 0.85)) return "¡Tirazo! 🔥";
  if (roll.value <= ((roll.sides || 20) * 0.20)) return "Eso no fue tu mejor momento... 🫣";
  if (roll.value < 5) return "¿Seguro que no es una moneda...? 🪙";
  if (roll.value % 2 === 0 && roll.value !== 2) return "¡Par, como tu destino! ⚖️";
  if (roll.value % 2 !== 0 && roll.value !== 1) return "¡Impar! La suerte es caótica. 🎲";

  // Extra: Si es múltiplo de 5
  if (roll.value % 5 === 0) return "¡Multiplicando la emoción x5! 🖐️";

  return null;
}


export default function SessionRoom({ sessionId, nickname }) {
  const [session, setSession] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const prevRollCount = useRef(0);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    const sessionRef = ref(db, `sessions/${sessionId}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      setSession(data);

      if (
        data &&
        Array.isArray(data.rolls) &&
        prevRollCount.current !== undefined &&
        prevRollCount.current !== 0 &&
        data.rolls.length > prevRollCount.current
      ) {
        // Última tirada que no esté pendiente
        const lastRoll = [...data.rolls]
          .reverse()
          .find((r) => !r.pending);
        if (lastRoll) {
          setToastMsg(`${lastRoll.nick} tiró un ${lastRoll.dice}: ${lastRoll.value}`);
          setToastOpen(true);
        }
      }
      prevRollCount.current = data?.rolls?.length || 0;
    });

    return () => {
      off(sessionRef);
      unsubscribe && unsubscribe();
    };
  }, [sessionId]);

  if (!session) return null;

  const rolls = Array.isArray(session.rolls) ? session.rolls : [];
  const lastRoll = rolls.length ? rolls[rolls.length - 1] : null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0ecfc 0%, #c7eafd 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}

    >
      <Box container display="flex" justifyContent="space-around" flexDirection="row" gap={2} sx={{ width: "100%", maxWidth: 1200 }}>
        {/* Columna 1: Jugadores y Última tirada */}
        <Grid item xs={12} md={4}>
          <LeftPanel
            players={session.players}
            nickname={nickname}
            lastRoll={lastRoll}
          />
        </Grid>

        {/* Columna 2: Configuración y animación */}
        <Grid item xs={12} md={4}>
          <CenterPanel sessionId={sessionId} nickname={nickname} />
        </Grid>

        {/* Columna 3: Historial */}
        <Grid item xs={12} md={4}>
          <RightPanel
            rolls={rolls}
            nickname={nickname}
            openIndex={openIndex}
            setOpenIndex={setOpenIndex}
            getFunnyLabel={getFunnyLabel}
          />
        </Grid>
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="info"
          onClose={() => setToastOpen(false)}
        >
          {toastMsg}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
