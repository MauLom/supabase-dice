import { useState } from "react";
import { ref, get, set } from "firebase/database";
import { db } from "../firebaseClient";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { motion, AnimatePresence } from "framer-motion";

const diceFaces = {
  D6: [1, 2, 3, 4, 5, 6],
  D20: Array.from({ length: 20 }, (_, i) => i + 1),
};

export default function DiceRoller({ sessionId, nickname }) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(null);
  const [dice, setDice] = useState("D6");

  const playSound = () => {
    const audio = new Audio("/dice.mp3");
    audio.play();
  };

  const rollDice = async () => {
    setRolling(true);
    playSound();

    // 1. Agrega la tirada pendiente ANTES de la animación
    const sessionRef = ref(db, `sessions/${sessionId}`);
    const snap = await get(sessionRef);
    const session = snap.val();
    const newRoll = {
      nick: nickname,
      dice,
      timestamp: Date.now(),
      pending: true,
    };
    const newRolls = [...(session.rolls || []), newRoll];
    await set(sessionRef, { ...session, rolls: newRolls });

    // 2. Animación visual local
    let ticks = 0;
    function animateRoll() {
      ticks++;
      const fakeFace =
        diceFaces[dice][Math.floor(Math.random() * diceFaces[dice].length)];
      setFace(fakeFace);
      if (ticks < 15) {
        setTimeout(animateRoll, 40 + ticks * 7);
      } else {
        const max = dice === "D6" ? 6 : 20;
        const value = Math.floor(Math.random() * max) + 1;
        setTimeout(async () => {
          setFace(value);
          setRolling(false);

          // 3. Actualiza la tirada pendiente con el valor real y pending: false
          const freshSnap = await get(sessionRef);
          const freshSession = freshSnap.val();

          // Busca el último roll pendiente de este usuario
          const lastPendingIdx = (freshSession.rolls || [])
            .map((r, i) => ({ ...r, i }))
            .reverse()
            .find(
              (r) => r.nick === nickname && r.pending
            )?.i;

          if (lastPendingIdx !== undefined) {
            const updatedRolls = [...freshSession.rolls];
            updatedRolls[lastPendingIdx] = {
              ...updatedRolls[lastPendingIdx],
              value,
              pending: false,
              resolvedAt: Date.now(),
            };
            await set(sessionRef, { ...freshSession, rolls: updatedRolls });
          }
        }, 400);
      }
    }
    animateRoll();
  };

  return (
    <Box textAlign="center">
      <Box mb={2}>
        <Typography variant="body2" mb={1}>
          Tipo de dado:
        </Typography>
        <Select
          value={dice}
          disabled={rolling}
          onChange={(e) => setDice(e.target.value)}
          size="small"
          sx={{ minWidth: 100, mb: 1 }}
        >
          <MenuItem value="D6">D6</MenuItem>
          <MenuItem value="D20">D20</MenuItem>
        </Select>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Button
          variant="contained"
          size="large"
          disabled={rolling}
          onClick={rollDice}
          sx={{ mb: 2 }}
        >
          {rolling ? "Rodando..." : "¡Tirar!"}
        </Button>
        <Box display="flex" flexDirection="row" alignItems="center">
          <AnimatePresence>
            {face !== null && (
              <motion.div
                key={face + dice + rolling}
                initial={{ rotate: -120, opacity: 0, scale: 0.7 }}
                animate={{
                  rotate: rolling ? 360 : 0,
                  opacity: 1,
                  scale: 1,
                  transition: { type: "spring", duration: 0.6 },
                }}
                exit={{ opacity: 0, scale: 0.7 }}
                style={{
                  display: "inline-block",
                  marginTop: "18px",
                  fontSize: dice === "D20" ? "3.5rem" : "3rem",
                  fontWeight: 700,
                  background:
                    dice === "D20"
                      ? "linear-gradient(120deg, #a7d2fd, #377cfb)"
                      : "linear-gradient(120deg, #fdf2a7, #fdc337)",
                  borderRadius: dice === "D20" ? "20% 40% 30% 60%" : "15%",
                  minWidth: "80px",
                  minHeight: "80px",
                  lineHeight: "80px",
                  boxShadow: "0 2px 16px #377cfb33",
                  border: "4px solid #fff",
                  userSelect: "none",
                }}
              >
                {face}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
