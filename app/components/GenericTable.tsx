import React, { useState, forwardRef } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableCell,
    TableFooter,
    TableHead,
    TableRow,
    Menu,
    MenuItem,
    IconButton,
    Tooltip
} from '@mui/material';
import { 
    MoreVert,
    ArrowDropDown as ArrowDropDownIcon,
    ArrowDropUp as ArrowDropUpIcon,
    InfoOutlined 
} from '@mui/icons-material';

const ROW_HEIGHT = 53;

interface ColumnDefinition<T> {
    id: string;
    label: string;
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
    render?: (row: T) => React.ReactNode;
    minWidth?: number;
    tooltip?: string;
    sortValue?: (row: T) => any; // Function to extract the value for sorting
}

interface MenuAction {
    label: string;
    action: string;
}

interface GenericTableProps<T> {
    data: T[];
    columns: ColumnDefinition<T>[];
    onRowAction?: (action: string, row: T) => void; // Callback for row actions
    campaignSpecificActions?: boolean;
    isLoading?: boolean; // New prop to indicate loading state
    menuActions?: MenuAction[]; // Custom menu actions
}

const tableRowBodyStyle = {
    borderBottom: '0.25px solid #333',
    color: '#fff',
    paddingTop: '5px',
    paddingBottom: '5px',
    fontSize: '13px',
    verticalAlign: 'middle',
    backgroundColor: '#1a1a1a',
    margin: '0px'
};

const tableRowHeaderStyle = {
    borderBottom: '0.5px solid #333',
    color: '#fff',
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#1a1a1a',
    margin: '0px'
};

const GenericTableComponent = forwardRef(
    <T,>(
        { data, columns, onRowAction, campaignSpecificActions = false, isLoading = false, menuActions }: GenericTableProps<T>,
        ref: React.Ref<HTMLDivElement>
    ) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<T | null>(null);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, row: T) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleMenuAction = (action: string) => {
        if (selectedRow && onRowAction) {
            onRowAction(action, selectedRow);
        }
        handleClose();
    };

    // Default menu actions if none provided
    const defaultMenuActions: MenuAction[] = [
        { label: 'More Info', action: 'edit' }
    ];

    const handleSort = (columnId: string) => {
        if (sortColumn === columnId) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnId);
            setSortDirection('asc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (sortColumn) {
            const column = columns.find(col => col.id === sortColumn);

            // Use sortValue function if provided, otherwise fall back to direct property access
            const aValue = column?.sortValue ? column.sortValue(a) : (a as any)[sortColumn];
            const bValue = column?.sortValue ? column.sortValue(b) : (b as any)[sortColumn];

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
        }
        return 0;
    });

    const totalColumns = columns.length + (campaignSpecificActions ? 1 : 0);

    return (
        <TableContainer
            ref={ref}
            component={Paper}
            sx={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '10px',
                maxHeight: 'calc(100vh - 200px)',
                overflow: 'auto',
                marginBottom: '20px'
            }}
        >
            <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell
                                key={column.id}
                                sx={{ ...tableRowHeaderStyle, textAlign: column.align || 'left', cursor: 'pointer' }}
                                onClick={() => handleSort(column.id)}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start',
                                    gap: '4px'
                                }}>
                                    {sortDirection === 'asc' ? <ArrowDropUpIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />}
                                    {column.label}
                                    {column.tooltip && (
                                        <Tooltip
                                            title={column.tooltip}
                                            arrow
                                            placement="top"
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{
                                                '& .MuiTooltip-tooltip': {
                                                    backgroundColor: '#333',
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    padding: '8px 12px',
                                                    borderRadius: '4px'
                                                },
                                                '& .MuiTooltip-arrow': {
                                                    color: '#333'
                                                }
                                            }}
                                        >
                                            <InfoOutlined
                                                sx={{
                                                    fontSize: '16px',
                                                    color: '#999',
                                                    '&:hover': {
                                                        color: '#d45b15'
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    )}
                                </Box>
                            </TableCell>
                        ))}
                        {campaignSpecificActions && (
                            <TableCell sx={tableRowHeaderStyle}></TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedData.map((row: T, rowIndex: number) => (
                        <TableRow
                            key={`row-${rowIndex}`}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: ROW_HEIGHT }}
                        >
                            {columns.map((column) => (
                                <TableCell key={`${column.id}-${rowIndex}`} sx={{ ...tableRowBodyStyle, textAlign: column.align || 'left' }}>
                                    {column.render ? column.render(row) : (row as any)[column.id]}
                                </TableCell>
                            ))}
                            {campaignSpecificActions && !isLoading && (
                                <TableCell sx={[tableRowBodyStyle, { textAlign: 'right' }]}>
                                    <IconButton
                                        onClick={(e) => handleClick(e, row)}
                                        sx={{
                                            backgroundColor: '#333',
                                            color: 'white',
                                            borderRadius: '6px',
                                            padding: '6px',
                                            '&:hover': {
                                                backgroundColor: '#d45b15',
                                            },
                                            '&:focus': {
                                                outline: 'none'
                                            }
                                        }}
                                    >
                                        <MoreVert
                                            sx={{
                                                fontSize: '16px'
                                            }}
                                        />
                                    </IconButton>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter sx={{ position: 'sticky', bottom: 0, backgroundColor: '#252626', width: '100%' }}>
                    <TableRow>
                        <TableCell
                            colSpan={totalColumns}
                            sx={{
                                ...tableRowHeaderStyle,
                                textAlign: 'center',
                                borderTop: '0.5px solid #333',
                                borderBottom: 'none',
                                paddingLeft: '16px'
                            }}
                        >
                            {isLoading ? 'Loading data...' : `${sortedData.length} ${sortedData.length == 1 ? 'record' : 'records'}`}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            {campaignSpecificActions && (
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                    sx={{
                        '& .MuiPaper-root': {
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                            marginTop: '4px'
                        }
                    }}
                >
                    {(menuActions || defaultMenuActions).map((menuAction) => (
                        <MenuItem
                            key={menuAction.action}
                            onClick={() => handleMenuAction(menuAction.action)}
                            sx={{
                                padding: '5px 10px',
                                fontSize: '14px',
                                backgroundColor: '#1a1a1a',
                                color: 'white',
                                minWidth: '120px',
                                '&:hover': {
                                    backgroundColor: '#d45b15',
                                },
                                '&:focus': {
                                    outline: 'none'
                                }
                            }}
                        >
                            {menuAction.label}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </TableContainer>
    );
});

GenericTableComponent.displayName = 'GenericTable';

const GenericTable = GenericTableComponent as <T>(props: GenericTableProps<T> & { ref?: React.Ref<HTMLDivElement> }) => React.ReactElement;

export default GenericTable;
