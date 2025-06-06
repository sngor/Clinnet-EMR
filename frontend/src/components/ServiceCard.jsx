import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Box,
  IconButton,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const ServiceCard = ({ service, onTestService, sx }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const getStatusProps = (status) => {
    switch (status) {
      case "Online":
        return {
          color: "success",
          icon: (
            <CheckCircleOutlineIcon
              sx={{ color: theme.palette.success.main }}
            />
          ),
        };
      case "Error":
        return {
          color: "error",
          icon: <ErrorOutlineIcon sx={{ color: theme.palette.error.main }} />,
        };
      case "Checking...":
        return {
          color: "warning",
          icon: (
            <HourglassEmptyIcon sx={{ color: theme.palette.warning.main }} />
          ),
        };
      case "Potentially Degraded":
        return {
          color: "info",
          icon: <SyncProblemIcon sx={{ color: theme.palette.info.main }} />,
        };
      case "Unknown":
      default:
        return {
          color: "default",
          icon: (
            <HelpOutlineIcon sx={{ color: theme.palette.text.secondary }} />
          ),
        };
    }
  };

  const statusProps = getStatusProps(service.status);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      sx={{
        p: { xs: 1, sm: 1.5, md: 2 },
        display: "flex",
        flexDirection: { xs: 'column', sm: 'row' }, // Stack on xs
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 2,
        boxShadow: 3,
        borderLeft: `5px solid ${
          statusProps.icon.props.sx.color || theme.palette.grey[400]
        }`,
        ...sx,
      }}
    >
      {/* Icon */}
      <Box sx={{ mr: { sm: 2 }, mb: { xs: 1, sm: 0 }, display: "flex", alignItems: "center" }}>
        {service.icon &&
          React.cloneElement(service.icon, {
            sx: { color: statusProps.icon.props.sx.color },
          })}
      </Box>
      {/* Main content */}
      <Box sx={{ flex: 1, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {service.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
        >
          {service.status}
        </Typography>
        {expanded && (service.details || service.isCrudService) && (
          <CardContent sx={{ pt: 0, px: { xs: 0, sm: 2 } /* Adjust padding for expanded content */ }}>
            {service.details && (
              <Typography
                variant="body2"
                color={
                  (service.status === "Error" && !service.isCrudService) ||
                  (service.isCrudService &&
                    service.details &&
                    (service.details.toLowerCase().includes("failed") ||
                      service.details.toLowerCase().includes("error")))
                    ? "error.main"
                    : "text.secondary"
                }
                sx={{ mt: 1 }}
              >
                {service.details}
              </Typography>
            )}

            {service.isCrudService && service.crudStatus && (
              <Box
                sx={{ mt: 1.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}
              >
                {Object.entries(service.crudStatus)
                  .filter(([key]) =>
                    ["create", "read", "update", "delete"].includes(key)
                  )
                  .map(([op, opStat]) => {
                    let chipColor = "default";
                    let displayStatus = opStat || "Unknown";
                    if (
                      displayStatus === "OK" ||
                      displayStatus === "OK (cleaned up)"
                    )
                      chipColor = "success";
                    else if (displayStatus === "Checking...")
                      chipColor = "warning";
                    else if (
                      displayStatus !== "Unknown" &&
                      displayStatus !== "PENDING" &&
                      displayStatus !==
                        "SKIPPED - User not created by this test."
                    )
                      chipColor = "error";

                    return (
                      <Chip
                        key={op}
                        label={`${op
                          .charAt(0)
                          .toUpperCase()}: ${displayStatus.substring(0, 20)}${
                          displayStatus.length > 20 ? "..." : ""
                        }`}
                        size="small"
                        color={chipColor}
                        variant="outlined"
                      />
                    );
                  })}
              </Box>
            )}
          </CardContent>
        )}
      </Box>
      {/* Test button on the right */}
      {service.testable && (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onTestService(service.id)}
          sx={{
            ml: { sm: 2 },
            mt: { xs: 1, sm: (expanded ? 2 : 0) }, // Adjust margin top for xs and when expanded on sm+
            whiteSpace: "nowrap",
            alignSelf: { xs: 'flex-end', sm: 'center' } // Align button to end on xs
          }}
          size={expanded ? "medium" : "small"} // Potentially adjust size
        >
          {service.status === "Checking..." ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Check"
          )}
        </Button>
      )}
      {(service.details || service.isCrudService) && (
        <IconButton
          onClick={handleToggleExpand}
          size="small"
          sx={{
            position: "absolute",
            top: { xs: 4, sm: 8 }, // Adjust position for xs
            right: { xs: 4, sm: 8 }
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      )}
    </Paper>
  );
};

export default ServiceCard;
