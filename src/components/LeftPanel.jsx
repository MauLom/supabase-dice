import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";

export default function LeftPanel({ players = [], nickname, lastRoll }) {
  return (
    <Paper elevation={4} sx={{ p: 3, minHeight: 350 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
        Jugadores en sala
      </Typography>
      <List sx={{ mb: 3 }}>
        {players.map((p, i) => (
          <ListItem
            key={i}
            sx={{
              bgcolor:
                lastRoll?.nick === p.nick
                  ? "warning.light"
                  : p.nick === nickname
                  ? "primary.light"
                  : "grey.100",
              color: lastRoll?.nick === p.nick
                ? "warning.main"
                : p.nick === nickname
                ? "primary.contrastText"
                : "inherit",
              borderRadius: 2,
              mb: 1,
              display: "flex",
              alignItems: "center",
              fontWeight: p.nick === nickname ? "bold" : "normal",
            }}
          >
            <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: "primary.main" }}>
              {p.nick[0]?.toUpperCase() || "?"}
            </Avatar>
            {p.nick}
            {lastRoll?.nick === p.nick && (
              <Chip label="Última tirada" color="warning" size="small" sx={{ ml: 1 }} />
            )}
            {p.nick === nickname && (
              <Chip label="Tú" color="primary" size="small" sx={{ ml: 1 }} />
            )}
          </ListItem>
        ))}
      </List>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Última tirada:
        </Typography>
        {lastRoll ? (
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.100",
              borderRadius: 2,
              textAlign: "center",
              boxShadow: 1,
            }}
          >
            <Typography>
              <strong>{lastRoll.nick}</strong> tiró {lastRoll.numDice || 1}x {lastRoll.dice}: <b>{lastRoll.value}</b>
            </Typography>
            {lastRoll.comment && (
              <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                “{lastRoll.comment}”
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nadie ha tirado aún.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
