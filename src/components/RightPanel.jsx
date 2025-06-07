import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CircularProgress from "@mui/material/CircularProgress";



export default function RightPanel({
  rolls = [],
  nickname,
  openIndex,
  setOpenIndex,
  getFunnyLabel = getFunnyLabel, // Default to our own if not provided
}) {
  return (
    <Paper elevation={4} sx={{ p: 3, minHeight: 350 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
        Historial de tiradas
      </Typography>
      <Box
        sx={{
          width: "100%",
          maxHeight: 340,
          overflowY: "auto",
          pr: 1,
        }}
      >
        <List sx={{ width: "100%" }}>
          {rolls.length > 0 ? (
            rolls
              .slice()
              .reverse()
              .map((r, i) => (
                <Box key={i}>
                  <ListItem
                    sx={{
                      bgcolor: r.nick === nickname ? "success.light" : "grey.100",
                      borderRadius: 2,
                      mb: 1,
                      py: 1,
                      px: 2,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    disableGutters
                    onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: r.nick === nickname ? "success.main" : "primary.main",
                        mr: 2,
                        fontSize: 15,
                      }}
                    >
                      {r.nick[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        component="span"
                        sx={{
                          fontWeight: r.nick === nickname ? "bold" : "normal",
                          display: "inline",
                          mr: 1,
                          color: r.nick === nickname ? "success.dark" : "primary.dark",
                        }}
                      >
                        {r.nick}
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          display: "inline",
                          fontWeight: "bold",
                          mr: 1,
                        }}
                      >
                        {Array.isArray(r.values)
                          ? r.values.join(", ")
                          : r.value}
                        <Chip
                          label={
                            (r.numDice > 1 ? `${r.numDice}x` : "") +
                            (r.dice || "")
                          }
                          size="small"
                          color="default"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      {/* NO RENDER funnyLabel aquí */}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {new Date(r.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenIndex(openIndex === i ? -1 : i);
                      }}
                      aria-label={openIndex === i ? "Cerrar" : "Ver detalle"}
                    >
                      {openIndex === i ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </ListItem>
                  <Collapse in={openIndex === i} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 7, py: 1 }}>
                      {Array.isArray(r.values) && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Valores:{" "}
                          {r.values.map((v, idx) => (
                            <Chip
                              key={idx}
                              label={v}
                              color="info"
                              size="small"
                              sx={{ mx: 0.3 }}
                            />
                          ))}
                        </Typography>
                      )}
                      {r.comment && (
                        <Box
                          sx={{
                            maxHeight: 70,
                            overflowY: "auto",
                            bgcolor: "#f6f8fa",
                            p: 1,
                            borderRadius: 2,
                            mt: 0.5,
                            fontSize: 14,
                            wordBreak: "break-word",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontStyle: "italic",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {r.comment}
                          </Typography>
                        </Box>
                      )}
                      {/* Aquí sí va la etiqueta divertida */}
                      {getFunnyLabel(r) && (
                        <Chip
                          label={getFunnyLabel(r)}
                          size="small"
                          color="secondary"
                          sx={{
                            mt: 1,
                            maxWidth: 210,
                            whiteSpace: "normal",
                            textAlign: "center",
                          }}
                        />
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Nadie ha tirado dados aún.
            </Typography>
          )}
        </List>
      </Box>
    </Paper>
  );
}
