import AddIcon from "@mui/icons-material/Add";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import { AnalyticsType } from "core";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import React, { ReactNode, useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { useAnalyticsBlockPresets } from "./api/Analytics.data";

export interface AnalyticsListEditorProps {
    type: AnalyticsType;
    handleAddBlock: (preset?: AnalyticsBlock) => Promise<void>;
    blocks: AnalyticsBlock[];
    renderBlock: (block: AnalyticsBlock, index: number) => ReactNode;
}

export default function AnalyticsListEditor(props: AnalyticsListEditorProps) {
    const { type, handleAddBlock, blocks, renderBlock } = props;
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { data } = useAnalyticsBlockPresets();

    const presets = (data?.publishedAnalyticsBlockPresets || []).filter(
        (p) => p.type === type
    );

    const handleClickAddBlock = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setAnchorEl(event.currentTarget);
    };

    const flipKey = blocks.map((block) => block.id).join("-");

    return (
        <Container maxWidth="xl" disableGutters>
            <Flipper flipKey={flipKey}>
                <Grid container spacing={1}>
                    {blocks.map((block, index) => (
                        <Flipped key={block.id} flipId={block.id}>
                            <Grid item xs={12} md={block.fullWidth ? 12 : 6}>
                                {renderBlock(block, index)}
                            </Grid>
                        </Flipped>
                    ))}
                </Grid>
            </Flipper>
            <Box
                sx={{
                    width: "100%",
                    marginTop: 3,
                }}
            >
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleClickAddBlock}
                    color="primary"
                    startIcon={<AddIcon />}
                >
                    {t("addAnalyticsBlock")}
                </Button>
            </Box>
            <Menu
                id="analytics-block-menu"
                anchorEl={anchorEl}
                keepMounted
                variant="menu"
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {presets.map((preset) => (
                    <MenuItem
                        key={`preset_${preset.id}`}
                        onClick={() => {
                            setAnchorEl(null);
                            handleAddBlock(preset);
                        }}
                    >
                        <ListItemText primary={t(preset.presetName)} />
                    </MenuItem>
                ))}
                {<Divider />}
                {
                    <MenuItem
                        onClick={() => {
                            setAnchorEl(null);
                            handleAddBlock();
                        }}
                    >
                        <ListItemText
                            primary={<i>{t("analytics:addBlank")}</i>}
                        />
                    </MenuItem>
                }
            </Menu>
        </Container>
    );
}
