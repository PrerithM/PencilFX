import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Plus, Trash2, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { validateGoogleDriveUrl } from '../../utils/driveValidator';
import { calculatePrintCost } from '../../utils/pricing';
import { useStore } from '../../context/StoreContext';
import { ColorMode, SideMode, PaperSize, FinishingType, PrintJob } from '../../types';

export const PrintJobConfigurator: React.FC = () => {
  const { addToCartPrintJob, pricingConfig } = useStore();
  const navigate = useNavigate();

  // Multi-document links state
  const [driveLinks, setDriveLinks] = useState<string[]>(['']);
  const [linkErrors, setLinkErrors] = useState<string[]>(['']);
  
  // Explicit permission confirmation checkbox
  const [hasConfirmedPermissions, setHasConfirmedPermissions] = useState(false);

  // Print Specifications
  const [pageRange, setPageRange] = useState('All');
  const [pageCount, setPageCount] = useState<number>(10);
  const [copies, setCopies] = useState<number>(1);
  const [colorMode, setColorMode] = useState<ColorMode>('bw');
  const [sides, setSides] = useState<SideMode>('double');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [finishing, setFinishing] = useState<FinishingType>('staple');
  const [notes, setNotes] = useState('');

  // Live price calculation using pricingConfig
  const pricing = calculatePrintCost(
    {
      pageCount,
      colorMode,
      sides,
      paperSize,
      finishing,
      copies,
    },
    pricingConfig
  );

  const handleLinkChange = (index: number, val: string) => {
    const updated = [...driveLinks];
    updated[index] = val;
    setDriveLinks(updated);

    const validation = validateGoogleDriveUrl(val);
    const errs = [...linkErrors];
    errs[index] = val.trim() ? (validation.isValid ? '' : (validation.error || 'Invalid link')) : '';
    setLinkErrors(errs);
  };

  const addLinkField = () => {
    setDriveLinks([...driveLinks, '']);
    setLinkErrors([...linkErrors, '']);
  };

  const removeLinkField = (index: number) => {
    if (driveLinks.length <= 1) return;
    setDriveLinks(driveLinks.filter((_, i) => i !== index));
    setLinkErrors(linkErrors.filter((_, i) => i !== index));
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    const validLinks = driveLinks
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && validateGoogleDriveUrl(l).isValid);

    if (validLinks.length === 0) {
      alert('Please enter at least one valid Google Drive shareable link.');
      return;
    }

    if (!hasConfirmedPermissions) {
      alert('Please confirm that the Google Drive sharing permissions allow view access.');
      return;
    }

    const printJob: PrintJob = {
      id: `print-${Date.now()}`,
      driveUrls: validLinks,
      pageRange: pageRange.trim() || 'All',
      estimatedPages: pageCount,
      copies,
      colorMode,
      sides,
      paperSize,
      finishing,
      notes: notes.trim(),
      cost: pricing.totalCost,
    };

    addToCartPrintJob(printJob);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header */}
      <div className="border border-paper-border bg-paper-surface p-5 sm:p-6 mb-6 shadow-paper">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-2 bg-brand-light border border-brand-primary/30 text-brand-primary">
            <Printer className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Document Printout & Photocopy Configurator
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Upload documents to your student Google Drive, set permissions to <em>"Anyone with the link can view"</em>, and configure your print specifications below.
        </p>
      </div>

      <form onSubmit={handleAddToCart} className="space-y-6">
        
        {/* Step 1: Google Drive Links */}
        <div className="bg-paper-surface border border-paper-border p-5 shadow-paper">
          <div className="flex items-center justify-between mb-3 border-b border-paper-border pb-2">
            <div>
              <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
                1. Google Drive Document Links
              </h2>
              <p className="text-xs text-ink-muted">Add shareable links to your PDF / Word / Notes files.</p>
            </div>
            <button
              type="button"
              onClick={addLinkField}
              className="text-xs font-semibold text-brand-primary hover:text-brand-deep flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Document</span>
            </button>
          </div>

          <div className="space-y-3">
            {driveLinks.map((link, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    required={idx === 0}
                    className={`flex-1 px-3 py-1.5 text-xs bg-paper-warm border ${
                      linkErrors[idx] ? 'border-red-400 bg-red-50/30' : 'border-paper-borderStrong'
                    } text-ink focus:outline-none focus:border-brand-primary focus:bg-white`}
                  />
                  {link && validateGoogleDriveUrl(link).isValid && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Test open link"
                      className="p-1.5 text-ink-muted hover:text-brand-primary border border-paper-border"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {driveLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(idx)}
                      className="p-1.5 text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {linkErrors[idx] && (
                  <p className="text-[11px] text-red-600 font-medium">{linkErrors[idx]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Drive Sharing Permissions Confirmation Checklist */}
          <div className="mt-4 p-3 bg-amber-50/60 border border-amber-300 text-xs">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-800 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-amber-900">
                  Mandatory Google Drive Link Permission Checklist:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-amber-800">
                  <li>In Google Drive, click <strong>Share</strong> on your document.</li>
                  <li>Under General Access, change <em>Restricted</em> to <strong>"Anyone with the link"</strong> (Viewer).</li>
                  <li>Click <strong>Copy link</strong> and paste above.</li>
                </ol>
                <label className="flex items-center space-x-2 pt-1 font-semibold text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConfirmedPermissions}
                    onChange={(e) => setHasConfirmedPermissions(e.target.checked)}
                    required
                    className="w-4 h-4 text-brand-primary border-paper-borderStrong rounded-none focus:ring-brand-primary"
                  />
                  <span>I confirm that these Google Drive link(s) are set to "Anyone with the link can view".</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Print Specifications */}
        <div className="bg-paper-surface border border-paper-border p-5 shadow-paper">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wide mb-3 border-b border-paper-border pb-2">
            2. Print Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            
            {/* Color Mode */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">Color Option</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setColorMode('bw')}
                  className={`p-2 border text-center font-medium transition-colors ${
                    colorMode === 'bw'
                      ? 'bg-brand-light border-brand-primary text-brand-deep font-bold'
                      : 'bg-paper-warm border-paper-border text-ink-muted hover:bg-paper-muted'
                  }`}
                >
                  <div>Black & White</div>
                  <div className="text-[10px] text-ink-muted">₹{pricingConfig.rates.bw_single.rate} / page</div>
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode('color')}
                  className={`p-2 border text-center font-medium transition-colors ${
                    colorMode === 'color'
                      ? 'bg-brand-light border-brand-primary text-brand-deep font-bold'
                      : 'bg-paper-warm border-paper-border text-ink-muted hover:bg-paper-muted'
                  }`}
                >
                  <div>Full Color</div>
                  <div className="text-[10px] text-ink-muted">₹{pricingConfig.rates.color_single.rate} / page</div>
                </button>
              </div>
            </div>

            {/* Sides / Duplex */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">Print Sides</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSides('double')}
                  className={`p-2 border text-center font-medium transition-colors ${
                    sides === 'double'
                      ? 'bg-brand-light border-brand-primary text-brand-deep font-bold'
                      : 'bg-paper-warm border-paper-border text-ink-muted hover:bg-paper-muted'
                  }`}
                >
                  <div>Double-Sided</div>
                  <div className="text-[10px] text-brand-primary font-semibold">Save paper & cost</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSides('single')}
                  className={`p-2 border text-center font-medium transition-colors ${
                    sides === 'single'
                      ? 'bg-brand-light border-brand-primary text-brand-deep font-bold'
                      : 'bg-paper-warm border-paper-border text-ink-muted hover:bg-paper-muted'
                  }`}
                >
                  <div>Single-Sided</div>
                  <div className="text-[10px] text-ink-muted">Standard 1-side</div>
                </button>
              </div>
            </div>

            {/* Paper Size */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">Paper Size</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperSize('A4')}
                  className={`p-2 border text-center font-medium transition-colors ${
                    paperSize === 'A4'
                      ? 'bg-brand-light border-brand-primary text-brand-deep font-bold'
                      : 'bg-paper-warm border-paper-border text-ink-muted hover:bg-paper-muted'
                  }`}
                >
                  <div>A4 Standard</div>
                  <div className="text-[10px] text-ink-muted">Reports / Notes</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('A3')}
                  className={`p-2 border text-center font-medium transition-colors ${
                    paperSize === 'A3'
                      ? 'bg-brand-light border-brand-primary text-brand-deep font-bold'
                      : 'bg-paper-warm border-paper-border text-ink-muted hover:bg-paper-muted'
                  }`}
                >
                  <div>A3 Large</div>
                  <div className="text-[10px] text-ink-muted">CAD / Drawings</div>
                </button>
              </div>
            </div>

            {/* Finishing */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">Binding / Finishing</label>
              <select
                value={finishing}
                onChange={(e) => setFinishing(e.target.value as FinishingType)}
                className="w-full px-3 py-2 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary"
              >
                <option value="none">No Binding (Loose sheets)</option>
                <option value="staple">Corner Staple (Free)</option>
                <option value="spiral">Spiral Binding (+₹{pricingConfig.finishing.spiral.price})</option>
                <option value="strip">Soft Corner Clip File (+₹{pricingConfig.finishing.strip.price})</option>
              </select>
            </div>

            {/* Number of Pages */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">
                Total Pages in Document
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary"
              />
              <span className="text-[10px] text-ink-faint">Document page count estimate</span>
            </div>

            {/* Copies */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">
                Number of Copies
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary"
              />
              <span className="text-[10px] text-ink-faint">Sets of the document</span>
            </div>
          </div>

          {/* Page Range & Additional Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-paper-border text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">
                Page Range to Print (e.g. "All", "1-15", "Only odd pages")
              </label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="All"
                className="w-full px-3 py-1.5 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">
                Special Instructions for Counter
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Front cover page in color, rest B&W"
                className="w-full px-3 py-1.5 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Estimated Price Summary & Action */}
        <div className="bg-paper-surface border border-paper-border p-5 shadow-paper flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Estimated Print Cost
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-ink">₹{pricing.totalCost}</span>
              <span className="text-xs text-ink-muted">
                ({pageCount} pgs × ₹{pricing.ratePerPage}{pricing.sizeMultiplier > 1 ? ` × ${pricing.sizeMultiplier}x A3` : ''} + ₹{pricing.finishingCost} finishing) × {copies} copy
              </span>
            </div>
            <p className="text-[11px] text-ink-faint">
              Final verification by counter staff upon inspection at pickup.
            </p>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary hover:bg-brand-deep text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-paper border border-brand-deep"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Add Print Job to Order</span>
          </button>
        </div>
      </form>
    </div>
  );
};
