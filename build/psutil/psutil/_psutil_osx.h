/*
 * $Id: _psutil_osx.h 1048 2011-06-27 17:39:17Z g.rodola@gmail.com $
 *
 * OS X platform-specific module methods for _psutil_osx
 */

#include <Python.h>

// --- per-process functions
static PyObject* get_process_name(PyObject* self, PyObject* args);
static PyObject* get_process_cmdline(PyObject* self, PyObject* args);
static PyObject* get_process_ppid(PyObject* self, PyObject* args);
static PyObject* get_process_uids(PyObject* self, PyObject* args);
static PyObject* get_process_gids(PyObject* self, PyObject* args);
static PyObject* get_cpu_times(PyObject* self, PyObject* args);
static PyObject* get_process_create_time(PyObject* self, PyObject* args);
static PyObject* get_memory_info(PyObject* self, PyObject* args);
static PyObject* get_process_num_threads(PyObject* self, PyObject* args);
static PyObject* get_process_status(PyObject* self, PyObject* args);
static PyObject* get_process_threads(PyObject* self, PyObject* args);
static PyObject* get_process_open_files(PyObject* self, PyObject* args);
static PyObject* get_process_connections(PyObject* self, PyObject* args);
static PyObject* get_process_tty_nr(PyObject* self, PyObject* args);

// --- system-related functions
static PyObject* get_pid_list(PyObject* self, PyObject* args);
static PyObject* get_num_cpus(PyObject* self, PyObject* args);
static PyObject* get_total_phymem(PyObject* self, PyObject* args);
static PyObject* get_avail_phymem(PyObject* self, PyObject* args);
static PyObject* get_total_virtmem(PyObject* self, PyObject* args);
static PyObject* get_avail_virtmem(PyObject* self, PyObject* args);
static PyObject* get_system_cpu_times(PyObject* self, PyObject* args);
static PyObject* get_system_per_cpu_times(PyObject* self, PyObject* args);
static PyObject* get_system_boot_time(PyObject* self, PyObject* args);
static PyObject* get_disk_partitions(PyObject* self, PyObject* args);
