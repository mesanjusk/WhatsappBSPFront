import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { Card, Divider, Stack, Typography } from '@mui/material';

const variantStyles = {
  primary: (theme) => ({ bg: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }),
  success: (theme) => ({ bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }),
  warning: (theme) => ({ bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }),
  danger: (theme) => ({ bg: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }),
};

export default function SummaryCard({ title, value, icon: Icon, variant = 'primary', trend }) {
  return (
    <Card elevation={0} sx={{ p: 1.25, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.25}>
        <Stack spacing={0.4}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Stack>
        {Icon ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={(theme) => {
              const v = variantStyles[variant] || variantStyles.primary;
              const { bg, color } = v(theme);
              return { bgcolor: bg, color, width: 36, height: 36, borderRadius: 1.5 };
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Stack>
        ) : null}
      </Stack>
      {trend ? (
        <>
          <Divider sx={{ my: 0.8 }} />
          <Typography variant="caption" color="text.secondary">{trend}</Typography>
        </>
      ) : null}
    </Card>
  );
}

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger']),
  trend: PropTypes.string,
};
