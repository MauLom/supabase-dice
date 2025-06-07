import { useState } from "react";
import { ref, get, set } from "firebase/database";
import { db } from "../firebaseClient";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import { motion, AnimatePresence } from "framer-motion";

const STANDARD_DICE = [
    { label: "D4", sides: 4 },
    { label: "D6", sides: 6 },
    { label: "D8", sides: 8 },
    { label: "D10", sides: 10 },
    { label: "D12", sides: 12 },
    { label: "D20", sides: 20 },
    { label: "D100", sides: 100 },
    { label: "Personalizado", sides: "custom" },
];

export default function DiceRoller({ sessionId, nickname }) {
    const [rolling, setRolling] = useState(false);
    const [diceType, setDiceType] = useState("D6");
    const [customSides, setCustomSides] = useState("");
    const [numDice, setNumDice] = useState(1);
    const [face, setFace] = useState([]);
    const [comment, setComment] = useState("");

    const playSound = () => {
        const audio = new Audio("/dice.mp3");
        audio.play();
    };

    const getDiceSides = () => {
        if (diceType === "Personalizado") {
            const parsed = parseInt(customSides);
            return parsed > 1 ? parsed : 2;
        }
        const found = STANDARD_DICE.find((d) => d.label === diceType);
        return found ? found.sides : 6;
    };

    const rollDice = async () => {
        setRolling(true);
        playSound();
        const diceCount = Math.max(1, parseInt(numDice) || 1);
        const sides = getDiceSides();
        const diceLabel =
            diceType === "Personalizado" ? `D${sides}` : diceType;

        // Crea la tirada pendiente con info, SÓLO agrega comment si no está vacío
        const sessionRef = ref(db, `sessions/${sessionId}`);
        const snap = await get(sessionRef);
        const session = snap.val();
        const newRoll = {
            nick: nickname,
            dice: diceLabel,
            timestamp: Date.now(),
            pending: true,
            sides,
            numDice: diceCount,
        };
        if (comment.trim() !== "") {
            newRoll.comment = comment.trim();
        }
        const newRolls = [...(session.rolls || []), newRoll];
        await set(sessionRef, { ...session, rolls: newRolls });

        // Animación visual local (simula múltiples dados)
        let ticks = 0;
        function animateRoll() {
            ticks++;
            const fakeFaces = Array.from({ length: diceCount }, () =>
                Math.floor(Math.random() * sides) + 1
            );
            setFace(fakeFaces);
            if (ticks < 15) {
                setTimeout(animateRoll, 40 + ticks * 7);
            } else {
                const values = Array.from({ length: diceCount }, () =>
                    Math.floor(Math.random() * sides) + 1
                );
                setTimeout(async () => {
                    setFace(values);
                    setRolling(false);

                    // Actualiza la tirada pendiente
                    const freshSnap = await get(sessionRef);
                    const freshSession = freshSnap.val();
                    const lastPendingIdx = (freshSession.rolls || [])
                        .map((r, i) => ({ ...r, i }))
                        .reverse()
                        .find(
                            (r) =>
                                r.nick === nickname &&
                                r.pending &&
                                r.timestamp === newRoll.timestamp
                        )?.i;

                    if (lastPendingIdx !== undefined) {
                        const updatedRolls = [...freshSession.rolls];
                        updatedRolls[lastPendingIdx] = {
                            ...updatedRolls[lastPendingIdx],
                            values, // array de resultados
                            value: values.reduce((a, b) => a + b, 0), // suma total
                            pending: false,
                            resolvedAt: Date.now(),
                        };
                        if (
                            updatedRolls[lastPendingIdx].comment === undefined ||
                            updatedRolls[lastPendingIdx].comment === ""
                        ) {
                            delete updatedRolls[lastPendingIdx].comment;
                        }
                        await set(sessionRef, { ...freshSession, rolls: updatedRolls });
                    }
                    setComment("");
                }, 400);
            }
        }
        animateRoll();
    };

    return (
        <Box textAlign="center">
            <Box mb={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <Box>
                    <Select
                        value={diceType}
                        disabled={rolling}
                        onChange={(e) => setDiceType(e.target.value)}
                        size="small"
                        sx={{ minWidth: 100, mb: 1 }}
                    >
                        {STANDARD_DICE.map((d) => (
                            <MenuItem key={d.label} value={d.label}>
                                {d.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
                {diceType === "Personalizado" && (
                    <TextField
                        label="Caras"
                        value={customSides}
                        onChange={(e) => setCustomSides(e.target.value.replace(/\D/g, ""))}
                        disabled={rolling}
                        size="small"
                        sx={{ width: 90, mb: 1 }}
                        inputProps={{ min: 2, maxLength: 3 }}
                    />
                )}
                <Tooltip title="¿Cuántos dados tirar?" arrow>
                    <TextField
                        label="Cantidad"
                        value={numDice}
                        onChange={(e) =>
                            setNumDice(e.target.value.replace(/\D/g, ""))
                        }
                        disabled={rolling}
                        size="small"
                        sx={{ width: 80, mb: 1 }}
                        inputProps={{ min: 1, max: 30 }}
                    />
                </Tooltip>
                <Box mb={2}>
                    <TextField
                        label="Referencia/Comentario"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={rolling}
                        size="small"
                        fullWidth
                        inputProps={{ maxLength: 60 }}
                    />
                </Box>
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
                <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        minHeight: 110,
                        minWidth: 240,
                        maxWidth: 360,
                        width: "100%",
                        mb: 2,
                    }}
                >
                    <AnimatePresence>
                        {face.length > 0 ? (
                            <motion.div
                                // ...transiciones
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    minHeight: 90,
                                    minWidth: 210,
                                }}
                            >
                                {face.map((v, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            margin: "0 10px",
                                            fontSize: "2.2rem",
                                            minWidth: 48,
                                            display: "inline-block",
                                            textAlign: "center",
                                        }}
                                    >
                                        {v}
                                    </span>
                                ))}
                            </motion.div>
                        ) : (
                            // Si no hay cara mostrada, reserva el espacio igual
                            <Box sx={{ minHeight: 90, minWidth: 210 }} />
                        )}
                    </AnimatePresence>
                </Box>

            </Box>
        </Box>
    );
}
