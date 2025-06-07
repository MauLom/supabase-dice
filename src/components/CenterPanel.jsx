import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import DiceRoller from "./DiceRoller";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useState } from "react";

export default function CenterPanel({ sessionId, nickname }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 3, minHeight: 350 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          gap: 1,
        }}
      >
        <Chip
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>ID de sala:</span>
              <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
                {sessionId}
              </span>
            </Box>
          }
          color="primary"
          sx={{ fontWeight: "bold", fontSize: 15, px: 2, py: 0.5 }}
        />
        <Tooltip title="Copiar ID de sala">
          <IconButton
            aria-label="copiar id"
            size="small"
            color="primary"
            onClick={handleCopy}
            sx={{
              ml: 1,
              border: "1px solid #2196f3",
              bgcolor: "#f5fafd",
              "&:hover": { bgcolor: "#e3f2fd" },
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography
        variant="h5"
        fontWeight="bold"
        align="center"
        color="primary"
        gutterBottom
      >
        ¡Tira tus dados!
      </Typography>
      <DiceRoller sessionId={sessionId} nickname={nickname} />
      {/* Toast/alert para feedback */}
      <Snackbar
        open={copied}
        autoHideDuration={1400}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          sx={{ fontSize: 16 }}
        >
          ¡ID copiado al portapapeles!
        </MuiAlert>
      </Snackbar>
    </Paper>
  );
}
