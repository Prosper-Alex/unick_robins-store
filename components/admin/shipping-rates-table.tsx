"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createDeliveryRateAction,
  deleteDeliveryRateAction,
  updateDeliveryRateAction,
} from "@/src/actions/admin-delivery-rates";
import type { DeliveryRate, DeliveryRateInput } from "@/src/types/shipping";
import { formatCurrency, formatDate } from "@/src/utils/format";

const dialogContentClass =
  "max-h-[90vh] gap-0 overflow-y-auto border-white/10 bg-[#16071f] p-0 text-white ring-white/10 sm:max-w-xl";
const dialogHeaderClass =
  "sticky top-0 z-[55] -mx-px border-b border-white/10 bg-[#16071f]/95 px-4 py-4 pr-16 shadow-lg shadow-black/20 backdrop-blur-2xl sm:px-6";
const dialogBodyClass = "px-4 pb-4 pt-5 sm:px-6 sm:pb-6";

function RateDialogHeader({ title }: { title: string }) {
  return (
    <DialogHeader className={dialogHeaderClass}>
      <DialogTitle className="text-[#fff8df]">{title}</DialogTitle>
      <DialogClose asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[#d6b25e]/35 bg-[#f6e7b7] text-[#24102f] shadow-lg shadow-black/25 backdrop-blur transition hover:bg-white hover:text-[#24102f]">
          <X />
          <span className="sr-only">Close</span>
        </Button>
      </DialogClose>
    </DialogHeader>
  );
}

function ShippingRateForm({
  rate,
  onSaved,
}: {
  rate?: DeliveryRate;
  onSaved: (rate: DeliveryRate) => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"NGN" | "USD">(
    rate?.currency ?? "NGN",
  );
  const [isActive, setIsActive] = useState(rate?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData(event.currentTarget);
      const payload: DeliveryRateInput = {
        country_code: String(formData.get("country_code") ?? ""),
        country_name: String(formData.get("country_name") ?? ""),
        state_name: String(formData.get("state_name") ?? ""),
        standard_fee: Number(formData.get("standard_fee") ?? 0),
        express_fee: Number(formData.get("express_fee") ?? 0),
        currency,
        is_active: isActive,
      };

      if (!payload.country_code.trim() || !payload.country_name.trim()) {
        throw new Error("Country code and country name are required.");
      }

      if (
        !Number.isFinite(payload.standard_fee) ||
        payload.standard_fee < 0 ||
        !Number.isFinite(payload.express_fee) ||
        payload.express_fee < 0
      ) {
        throw new Error("Delivery fees must be valid positive amounts.");
      }

      const saved = rate?.id
        ? await updateDeliveryRateAction(rate.id, payload)
        : await createDeliveryRateAction(payload);

      onSaved(saved);
      setStatus(rate?.id ? "Shipping rate updated." : "Shipping rate added.");
      if (!rate) {
        event.currentTarget.reset();
        setCurrency("NGN");
        setIsActive(true);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 text-white" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="country_code">
            Country code
          </label>
          <Input
            id="country_code"
            name="country_code"
            defaultValue={rate?.country_code ?? "NG"}
            maxLength={2}
            className="h-11 border-white/10 bg-white/8 text-white"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="country_name">
            Country
          </label>
          <Input
            id="country_name"
            name="country_name"
            defaultValue={rate?.country_name ?? "Nigeria"}
            className="h-11 border-white/10 bg-white/8 text-white"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="state_name">
          State or region
        </label>
        <Input
          id="state_name"
          name="state_name"
          defaultValue={rate?.state_name ?? ""}
          placeholder="Leave empty for a country-wide fallback"
          className="h-11 border-white/10 bg-white/8 text-white placeholder:text-violet-100/45"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value as "NGN" | "USD")}
            className="h-11 rounded-lg border border-white/10 bg-[#24102f] px-3 text-sm text-white outline-none transition focus-visible:border-[#d6b25e] focus-visible:ring-3 focus-visible:ring-[#d6b25e]/30">
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="standard_fee">
            Standard fee
          </label>
          <Input
            id="standard_fee"
            name="standard_fee"
            type="number"
            min="0"
            step={currency === "NGN" ? "1" : "0.01"}
            defaultValue={rate?.standard_fee ?? 0}
            className="h-11 border-white/10 bg-white/8 text-white"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="express_fee">
            Express fee
          </label>
          <Input
            id="express_fee"
            name="express_fee"
            type="number"
            min="0"
            step={currency === "NGN" ? "1" : "0.01"}
            defaultValue={rate?.express_fee ?? 0}
            className="h-11 border-white/10 bg-white/8 text-white"
          />
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium">
        <input
          type="checkbox"
          className="size-4"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Active at checkout
      </label>
      {status && (
        <p className="rounded-lg bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200 ring-1 ring-emerald-300/20">
          {status}
        </p>
      )}
      <Button
        className="h-11 w-full rounded-full bg-[#d6b25e] px-6 text-[#24102f] hover:bg-[#f6e7b7] sm:w-fit"
        disabled={submitting}>
        Save shipping fee
      </Button>
    </form>
  );
}

function EditRateDialog({
  rate,
  onSaved,
}: {
  rate: DeliveryRate;
  onSaved: (rate: DeliveryRate) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-white/15 bg-white/6 text-white hover:bg-white/10 hover:text-white"
          aria-label={`Edit ${rate.country_name} ${rate.state_name ?? ""}`}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className={dialogContentClass} showCloseButton={false}>
        <RateDialogHeader title="Edit shipping fee" />
        <div className={dialogBodyClass}>
          <ShippingRateForm
            rate={rate}
            onSaved={(saved) => {
              onSaved(saved);
              setOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ShippingRatesTable({
  rates: initialRates,
  dataError,
}: {
  rates: DeliveryRate[];
  dataError?: string | null;
}) {
  const [rates, setRates] = useState(initialRates);
  const [message, setMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  async function remove(id: string) {
    const rate = rates.find((item) => item.id === id);
    if (
      !window.confirm(
        `Delete ${rate?.country_name ?? "this shipping fee"} ${rate?.state_name ?? ""}?`,
      )
    ) {
      return;
    }

    setMessage(null);
    try {
      await deleteDeliveryRateAction(id);
      setRates((current) => current.filter((item) => item.id !== id));
      setMessage("Shipping fee deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b25e]">
            Fulfillment
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-[1.1] text-white">
            Shipping fees
          </h1>
          <p className="my-2 text-sm text-violet-100/65">
            Manage the country and state delivery prices used during checkout.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="my-6 rounded-full bg-[#d6b25e] text-[#24102f] hover:bg-[#f6e7b7] sm:mt-10">
              <Plus /> Add fee
            </Button>
          </DialogTrigger>
          <DialogContent className={dialogContentClass} showCloseButton={false}>
            <RateDialogHeader title="Add shipping fee" />
            <div className={dialogBodyClass}>
              <ShippingRateForm
                onSaved={(rate) => {
                  setRates((current) => [rate, ...current]);
                  setMessage("Shipping fee added.");
                  setCreateOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {dataError && (
        <p className="rounded-xl bg-[#d6b25e]/15 px-4 py-3 text-sm text-[#f6e7b7] ring-1 ring-[#d6b25e]/25">
          {dataError}
        </p>
      )}
      {message && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 ring-1 ring-emerald-300/20">
          <CheckCircle2 className="size-4" />
          {message}
        </p>
      )}

      <div className="grid gap-3 md:hidden">
        {rates.map((rate) => (
          <div
            key={rate.id}
            className="rounded-2xl border border-white/10 bg-white/8 p-4 text-white shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {rate.country_name}
                  {rate.state_name ? `, ${rate.state_name}` : ""}
                </p>
                <p className="mt-1 text-xs text-violet-100/55">
                  {rate.country_code} · {rate.currency}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${rate.is_active ? "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20" : "bg-white/8 text-violet-100/70 ring-1 ring-white/10"}`}>
                {rate.is_active ? "Active" : "Off"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <span className="rounded-xl bg-[#24102f] px-3 py-2 text-violet-100/70">
                Standard{" "}
                <span className="block font-mono text-white">
                  {formatCurrency(rate.standard_fee, rate.currency)}
                </span>
              </span>
              <span className="rounded-xl bg-[#24102f] px-3 py-2 text-violet-100/70">
                Express{" "}
                <span className="block font-mono text-white">
                  {formatCurrency(rate.express_fee, rate.currency)}
                </span>
              </span>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <EditRateDialog
                rate={rate}
                onSaved={(saved) => {
                  setRates((current) =>
                    current.map((item) => (item.id === saved.id ? saved : item)),
                  );
                  setMessage("Shipping fee updated.");
                }}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => remove(rate.id)}
                aria-label="Delete shipping fee">
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-white/6 text-white shadow-xl shadow-black/20 backdrop-blur md:block">
        {rates.length > 0 ? (
          <Table className="min-w-220">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/4">
                <TableHead className="text-violet-100/70">Location</TableHead>
                <TableHead className="text-violet-100/70">Standard</TableHead>
                <TableHead className="text-violet-100/70">Express</TableHead>
                <TableHead className="text-violet-100/70">Status</TableHead>
                <TableHead className="text-violet-100/70">Updated</TableHead>
                <TableHead className="text-right text-violet-100/70">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow
                  key={rate.id}
                  className="border-white/10 hover:bg-white/4">
                  <TableCell>
                    <p className="font-medium">
                      {rate.country_name}
                      {rate.state_name ? `, ${rate.state_name}` : ""}
                    </p>
                    <p className="text-xs text-violet-100/55">
                      {rate.country_code} · {rate.currency}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(rate.standard_fee, rate.currency)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(rate.express_fee, rate.currency)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${rate.is_active ? "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20" : "bg-white/8 text-violet-100/70 ring-1 ring-white/10"}`}>
                      {rate.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-violet-100/60">
                    {formatDate(rate.updated_at ?? rate.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <EditRateDialog
                        rate={rate}
                        onSaved={(saved) => {
                          setRates((current) =>
                            current.map((item) =>
                              item.id === saved.id ? saved : item,
                            ),
                          );
                          setMessage("Shipping fee updated.");
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(rate.id)}
                        aria-label="Delete shipping fee">
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="px-4 py-12 text-center text-sm text-violet-100/65">
            No shipping fees yet. Add one to start charging by location.
          </div>
        )}
      </div>
    </div>
  );
}
