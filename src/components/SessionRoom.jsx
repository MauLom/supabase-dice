import { useEffect, useState, useRef } from "react";
import { ref, onValue, off } from "firebase/database";
import { db } from "../firebaseClient";
import DiceRoller from "./DiceRoller";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

export default function SessionRoom({ sessionId, nickname }) {
  const [session, setSession] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const prevRollCount = useRef(0);

  useEffect(() => {
    const sessionRef = ref(db, `sessions/${sessionId}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      setSession(data);

      if (
        data &&
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

  if (!session) return <Typography>Cargando sesión...</Typography>;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      mt={4}
      sx={{ width: "100%", minHeight: "80vh" }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 3,
          width: "100%",
          maxWidth: 500,
          bgcolor: "#fff",
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          align="center"
          color="primary"
          gutterBottom
        >
          Sala: <Chip label={sessionId} color="primary" size="small" />
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Jugadores conectados:
        </Typography>
        <List sx={{ display: "flex", flexWrap: "wrap", gap: 1, p: 0, mb: 2 }}>
          {session.players?.map((p, i) => (
            <ListItem
              key={i}
              sx={{
                width: "auto",
                py: 0.5,
                px: 1,
                borderRadius: 2,
                bgcolor:
                  p.nick === nickname
                    ? "primary.light"
                    : "grey.100",
                color: p.nick === nickname ? "primary.contrastText" : "inherit",
                mr: 1,
                mb: 1,
                display: "flex",
                alignItems: "center",
                fontWeight: p.nick === nickname ? "bold" : "normal",
              }}
              disableGutters
            >
              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: "primary.main", fontSize: 14 }}>
                {p.nick[0]?.toUpperCase() || "?"}
              </Avatar>
              {p.nick}
              {p.nick === nickname && (
                <Chip
                  label="¡Tú!"
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ my: 3 }}>
          <DiceRoller sessionId={sessionId} nickname={nickname} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Tiradas:
        </Typography>
        <List sx={{ width: "100%" }}>
          {session.rolls?.length > 0 ? (
            session.rolls
              .slice()
              .reverse()
              .map((r, i) => (
                <ListItem
                  key={i}
                  sx={{
                    bgcolor:
                      r.nick === nickname
                        ? "success.light"
                        : "grey.100",
                    borderRadius: 2,
                    mb: 1,
                    py: 1,
                    px: 2,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  disableGutters
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor:
                        r.nick === nickname
                          ? "success.main"
                          : "primary.main",
                      mr: 2,
                      fontSize: 15,
                    }}
                  >
                    {r.nick[0]?.toUpperCase() || "?"}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: r.nick === nickname ? "bold" : "normal",
                        display: "inline",
                        mr: 1,
                      }}
                      color={r.nick === nickname ? "success.dark" : "primary.dark"}
                    >
                      {r.nick}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        display: "inline",
                        fontWeight: "bold",
                        mr: 1,
                      }}
                    >
                      {r.pending ? (
                        <Box display="inline-flex" alignItems="center">
                          <CircularProgress size={18} color="warning" sx={{ mr: 1 }} />
                          <span style={{ color: "#f39c12", fontStyle: "italic" }}>
                            Lanzando...
                          </span>
                        </Box>
                      ) : (
                        r.value
                      )}
                    </Typography>
                    <Chip
                      label={r.dice}
                      size="small"
                      color={r.dice === "D20" ? "secondary" : "default"}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(r.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </ListItem>
              ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Nadie ha tirado dados aún.
            </Typography>
          )}
        </List>
      </Paper>
      {/* Toast */}
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
